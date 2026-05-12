import prisma from "../prisma";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: { event: "test/hello.world" } },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const handleAnnouncementSchedule = inngest.createFunction(
  {
    id: "announcement-schedule",
    triggers: { event: "announcement/scheduled" },
  },
  async ({ event, step }) => {
    const { announcementId, scheduleDate } = event.data;
    const targetDate = new Date(scheduleDate);

    if (Number.isNaN(targetDate.getTime())) {
      throw new Error("Invalid schedule date provided for announcement.");
    }
    // This method pauses execution until a specific date time.
    // Any date time string in the format accepted by the Date object,
    // for example YYYY-MM-DD or YYYY-MM-DDHH:mm:ss.
    // At maximum, functions can sleep for a year
    // (seven days for the free tier plans).
    await step.sleepUntil(
      "wait-until-scheduled-time",
      `${targetDate.toISOString()}`
    );

    await step.run("publish-announcement", async () => {
      await prisma.announcement.update({
        where: { id: announcementId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          scheduledFor: null,
        },
      });
    });

    return { announcementId, message: `Announcement published!` };
  }
);

// NOTE: onSemesterFeeCreated (old) has been replaced by the new 3-job design:
// - Job A (onSemesterFeePublished): triggers on fee/semester.published, fans out to all approved students
// - Job B (onStudentRegistrationApproved): handles late registrations after fee published
// - Job C (createStudentFeeRecord): shared idempotent worker for both paths

// ─── Job A: when semester fee is published → fan out to all approved students ──

export const onSemesterFeePublished = inngest.createFunction(
  {
    id: "fee/on-semester-published",
    triggers: { event: "fee/semester.published" },
  },
  async ({ event, step }) => {
    const { semesterId, semesterFeeId } = event.data;

    const registrations = await step.run("fetch-approved-registrations", () =>
      prisma.registration.findMany({
        where: { semesterId, status: "APPROVED" },
        select: { studentId: true },
      })
    );

    if (registrations.length === 0) {
      console.log(`No approved registrations for semester ${semesterId}`);
      return { dispatched: 0 };
    }

    await step.sendEvent(
      "dispatch-per-student",
      registrations.map((r) => ({
        name: "fee/student-record.create",
        data: { studentId: r.studentId, semesterFeeId },
      }))
    );

    return { dispatched: registrations.length };
  }
);

// ─── Job B: when a student's registration is approved → check for published fee ─

export const onStudentRegistrationApproved = inngest.createFunction(
  {
    id: "student/on-registration-approved",
    idempotency: "event.data.studentId + '-' + event.data.semesterId",
    triggers: { event: "student/registration.approved" },
  },
  async ({ event, step }) => {
    const { studentId, semesterId } = event.data;

    // Find the published SemesterFee for this semester.
    // If the accountant hasn't published it yet, exit cleanly —
    // Job A (fee/on-semester-published) will handle this student
    // when the fee is eventually published.
    const semesterFee = await step.run("fetch-published-semester-fee", () =>
      prisma.semesterFee.findFirst({
        where: {
          semesterId,
          status: "PUBLISHED",
        },
        include: {
          feeInstallments: {
            orderBy: { installmentNo: "asc" },
          },
        },
      })
    );

    if (!semesterFee) {
      console.log(
        `No published fee for semester ${semesterId} yet. ` +
          `Student ${studentId} will be covered when fee is published.`
      );
      return { skipped: true, reason: "fee-not-published-yet" };
    }

    if (semesterFee.feeInstallments.length === 0) {
      // Fee was published with no installments defined — accountant error.
      // Throw so Inngest retries; it will resolve once installments are added.
      throw new Error(
        `SemesterFee ${semesterFee.id} is published but has no installments. ` +
          `Add installments before publishing.`
      );
    }

    // Delegate to the shared per-student creation event.
    // Job C handles the actual upserts — same path whether triggered
    // by a publish fan-out or by a late registration.
    await step.sendEvent("dispatch-student-fee-creation", {
      name: "fee/student-record.create",
      data: { studentId, semesterFeeId: semesterFee.id },
    });

    return { dispatched: true, semesterFeeId: semesterFee.id };
  }
);

// ─── Job C: creates records for one student — called by both Job A and Job B ───

export const createStudentFeeRecord = inngest.createFunction(
  {
    id: "fee/create-student-fee-record",
    // one student per semesterFee — safe key for both fan-out paths
    idempotency: "event.data.studentId + '-' + event.data.semesterFeeId",
    triggers: { event: "fee/student-record.create" },
  },
  async ({ event, step }) => {
    const { studentId, semesterFeeId } = event.data;

    const semesterFee = await step.run("fetch-semester-fee", () =>
      prisma.semesterFee.findUniqueOrThrow({
        where: { id: semesterFeeId },
        include: {
          feeInstallments: { orderBy: { installmentNo: "asc" } },
        },
      })
    );

    await step.run("upsert-student-records", async () => {
      // Upsert StudentSemesterFee
      const studentSemFee = await prisma.studentSemesterFee.upsert({
        where: {
          studentId_semesterFeeId: { studentId, semesterFeeId },
        },
        create: {
          studentId,
          semesterFeeId,
          totalDue: semesterFee.totalAmount,
          status: "PENDING",
        },
        update: {}, // no-op — never overwrite an existing record on retry
      });

      // Upsert one StudentFeeInstallment per base template
      await prisma.$transaction(
        semesterFee.feeInstallments.map((template) =>
          prisma.studentFeeInstallment.upsert({
            where: {
              studentSemesterFeeId_orderNo: {
                studentSemesterFeeId: studentSemFee.id,
                orderNo: template.installmentNo,
              },
            },
            create: {
              studentId,
              studentSemesterFeeId: studentSemFee.id,
              feeInstallmentId: template.id, // traceability back to template
              amount: template.amount,
              dueDate: template.dueDate,
              orderNo: template.installmentNo,
              isBase: true,
              status: "UNPAID",
            },
            update: {}, // no-op — never overwrite split-approved amounts on retry
          })
        )
      );
    });

    console.log(
      `Created fee records for student ${studentId} for semesterFee ${semesterFeeId}`
    );

    return { studentId, semesterFeeId };
  }
);
