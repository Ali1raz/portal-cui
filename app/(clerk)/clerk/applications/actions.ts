"use server";

import { requireSession } from "@/app/data/session/require-session";
import { requirePermission } from "@/app/data/permission/require-permission";
import { getStudentRegistrationSeqCount } from "@/app/data/clerk/get-student-registration-seq-count";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ApiResponseType } from "@/lib/types";
import { Batch, Department, Program } from "@/lib/generated/prisma/enums";
import {
  clerkBulkUpdateApplicationStatusSchema,
  type ClerkBulkUpdateApplicationStatusInput,
  clerkUpdateApplicationStatusSchema,
  type ClerkUpdateApplicationStatusInput,
} from "./schemas";
import { CLERK_APPLICATION_REVIEWABLE_STATUSES } from "@/lib/data/utils";
import { SendEmail } from "@/app/actions/send-email";
import { env } from "@/lib/env";
import { generatePassword, generateStudentEmail } from "@/lib/utils";

function generateRegNumber({
  batch,
  year,
  program,
  department,
  seq,
}: {
  batch: Batch;
  year: number;
  program: Program;
  department: Department;
  seq: number;
}) {
  const yearTwoDigits = String(year).slice(-2);
  const formattedSeq = String(seq).padStart(3, "0");
  return `${batch}${yearTwoDigits}-${program}${department}-${formattedSeq}`;
}

function getSignInLink() {
  const appBaseUrl = env.NEXT_PUBLIC_BETTER_AUTH_URL || "localhost:3000";

  if (!appBaseUrl) {
    return "/login";
  }

  return `${appBaseUrl.replace(/\/$/, "")}/login`;
}

function getApplicationTrackingLink(applicationId: string) {
  const appBaseUrl = env.NEXT_PUBLIC_BETTER_AUTH_URL || "localhost:3000";

  if (!appBaseUrl) {
    return `/my-applications/${applicationId}`;
  }

  return `${appBaseUrl.replace(/\/$/, "")}/my-applications/${applicationId}`;
}

export async function clerkUpdateApplicationStatus(
  data: ClerkUpdateApplicationStatusInput
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();
    const can = await requirePermission({ applications: ["update"] });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update applications.",
      };
    }

    const { data: parsed, success } =
      clerkUpdateApplicationStatusSchema.safeParse(data);

    if (!success) {
      return {
        status: "error",
        message: "Invalid input.",
      };
    }

    const application = await prisma.studentApplication.findUnique({
      where: { id: parsed.applicationId },
      select: {
        id: true,
        status: true,
        semesterId: true,
        userId: true,
        preferredDepartment: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!application) {
      return { status: "error", message: "Application not found." };
    }

    if (!application.semesterId) {
      return { status: "error", message: "Associated semester not found." };
    }

    const seme = await prisma.semester.findUnique({
      where: { id: application.semesterId },
      select: { year: true, batch: true },
    });

    if (!seme) {
      return { status: "error", message: "Associated semester not found." };
    }

    if (!CLERK_APPLICATION_REVIEWABLE_STATUSES.includes(application.status)) {
      return {
        status: "error",
        message: "This application has already been reviewed.",
      };
    }

    // Only BS programs are supported currently.
    const program: Program = "B";

    // Captured from inside the transaction closure, read after commit.
    let approvedRegistrationNo: string | null = null;

    await prisma.$transaction(async (tx) => {
      await tx.studentApplication.update({
        where: { id: parsed.applicationId },
        data: { status: parsed.status },
      });

      if (parsed.status === "APPROVED") {
        // NOTE: getStudentRegistrationSeqCount ideally should accept `tx` to
        // prevent a race condition where two concurrent approvals for the same
        // department/batch/year read the same count and generate duplicate reg
        // numbers. Until then, concurrent bulk approvals carry this risk.
        const seq = await getStudentRegistrationSeqCount({
          batch: seme.batch,
          year: seme.year,
          department: application.preferredDepartment,
        });

        approvedRegistrationNo = generateRegNumber({
          batch: seme.batch,
          year: seme.year,
          program,
          department: application.preferredDepartment,
          seq,
        });
      }

      await tx.applicationReview.create({
        data: {
          applicationId: parsed.applicationId,
          actorRole: "CLERK",
          actorId: session.user.id,
          action:
            parsed.status === "APPROVED"
              ? "CLERK_APPROVED"
              : parsed.status === "REJECTED"
                ? "CLERK_REJECTED"
                : "CLERK_REVIEW_REQUESTED",
          remarks: parsed.remarks,
          fromStatus: application.status,
          toStatus: parsed.status,
        },
      });
    });

    // -------------------------------------------------------------------------
    // Post-transaction: create a brand-new Better Auth user for the student.
    //
    // The original applicant user is left completely unchanged (role stays
    // USER, email stays personal). A separate, dedicated student account is
    // created with:
    //   - email / username  → derived from the registration number
    //   - role              → STUDENT
    //   - emailVerified     → true  (no verification email needed)
    //   - password          → auto-generated, sent to the applicant's inbox
    //
    // Student and Registration records are then linked to this new user ID.
    // -------------------------------------------------------------------------
    if (parsed.status === "APPROVED" && approvedRegistrationNo) {
      const registrationNo = approvedRegistrationNo as string;
      const generatedPassword = generatePassword({});
      const studentEmail = generateStudentEmail({ regNo: registrationNo });

      // Create the dedicated student Better Auth account.
      const { user: newAuthUser } = await auth.api.createUser({
        body: {
          email: studentEmail,
          password: generatedPassword,
          name: application.user.name,
          role: "STUDENT",
          data: {
            username: registrationNo,
            displayUsername: registrationNo,
            emailVerified: true,
          },
        },
      });

      // Atomically create the Student profile and initial Registration record
      // both linked to the new student user account.
      await prisma.$transaction(async (tx) => {
        const student = await tx.student.create({
          data: {
            department: application.preferredDepartment,
            program,
            registrationNo,
            user: { connect: { id: newAuthUser.id } },
          },
          select: { id: true },
        });

        await tx.registration.create({
          data: {
            userId: newAuthUser.id,
            studentId: student.id,
            semesterId: application.semesterId as string,
            status: "APPROVED",
          },
        });
      });

      // Send credentials to the applicant's original personal email address.
      await SendEmail({
        to: application.user.email,
        subject:
          "Your Registration Application Is Approved – Login Credentials",
        meta: {
          description:
            `Congratulations ${application.user.name}, your registration application has been approved.\n\n` +
            `Your student login credentials:\n` +
            `  Username / Registration No: ${registrationNo}\n` +
            `  Email: ${studentEmail}\n` +
            `  Password: ${generatedPassword}\n\n` +
            `You can sign in using your registration number or your CUI email with the password above.`,
          link: getSignInLink(),
        },
      });
    }

    if (parsed.status === "REVIEW_REQUESTED") {
      const remarksDescription = parsed.remarks?.trim().length
        ? `Details: ${parsed.remarks.trim()}`
        : "Details: Please review your submitted details and update missing information.";

      await SendEmail({
        to: application.user.email,
        subject: "Update requested for Your Application",
        meta: {
          description: `Hi ${application.user.name}, more information is required for your registration application. ${remarksDescription} Open your application page to track progress and update details.`,
          link: getApplicationTrackingLink(application.id),
        },
      });
    }

    return {
      status: "success",
      message:
        parsed.status === "APPROVED"
          ? "Application approved successfully."
          : parsed.status === "REVIEW_REQUESTED"
            ? "Student has been asked to provide more information."
            : "Application rejected successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function clerkBulkUpdateApplicationStatus(
  data: ClerkBulkUpdateApplicationStatusInput
): Promise<ApiResponseType> {
  try {
    await requireSession();
    const can = await requirePermission({ applications: ["update"] });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update applications.",
      };
    }

    const { data: parsed, success } =
      clerkBulkUpdateApplicationStatusSchema.safeParse(data);

    if (!success) {
      return {
        status: "error",
        message: "Invalid input.",
      };
    }

    const uniqueApplicationIds = Array.from(new Set(parsed.applicationIds));

    if (uniqueApplicationIds.length === 0) {
      return {
        status: "error",
        message: "No applications selected.",
      };
    }

    let successCount = 0;
    let failedCount = 0;
    let firstErrorMessage = "";

    for (const applicationId of uniqueApplicationIds) {
      const result = await clerkUpdateApplicationStatus({
        applicationId,
        status: parsed.status,
        remarks: parsed.remarks,
      });

      if (result.status === "success") {
        successCount += 1;
      } else {
        failedCount += 1;
        if (!firstErrorMessage) {
          firstErrorMessage = result.message;
        }
      }
    }

    if (successCount === 0) {
      return {
        status: "error",
        message: firstErrorMessage || "No applications were updated.",
      };
    }

    if (failedCount > 0) {
      return {
        status: "success",
        message: `Updated ${successCount} ${successCount === 1 ? "application" : "applications"}. ${failedCount} ${failedCount === 1 ? "application was" : "applications were"} skipped.`,
      };
    }

    return {
      status: "success",
      message: `Successfully updated ${successCount} ${successCount === 1 ? "application" : "applications"}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
