"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireStudentSession } from "@/app/data/student/require-student-session";
import { protect } from "@/lib/arcjet-protect";
import { EnrollmentStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

async function getStudentIdByUserId(userId: string): Promise<string | null> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  return student?.id ?? null;
}

export async function enrollCourse(
  offeringId: string
): Promise<ApiResponseType> {
  try {
    const session = await requireStudentSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      subjectOfferings: ["enroll"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to enroll in courses.",
      };
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return {
        status: "error",
        message: "Student profile not found.",
      };
    }

    const now = new Date();

    const offering = await prisma.subjectOffering.findUnique({
      where: { id: offeringId },
      select: {
        id: true,
        semesterId: true,
        semester: {
          select: {
            id: true,
            enrollmentStart: true,
            enrollmentEnd: true,
          },
        },
      },
    });

    if (!offering?.semesterId || !offering.semester) {
      return {
        status: "error",
        message: "Subject offering is not available for enrollment.",
      };
    }

    if (
      offering.semester.enrollmentStart > now ||
      offering.semester.enrollmentEnd < now
    ) {
      return {
        status: "error",
        message: "Enrollment window is closed for this course.",
      };
    }

    const approvedRegistration = await prisma.registration.findFirst({
      where: {
        studentId: student.id,
        semesterId: offering.semesterId,
        status: "APPROVED",
      },
      select: { id: true },
    });

    if (!approvedRegistration) {
      return {
        status: "error",
        message: "You need an approved registration for this semester.",
      };
    }

    // ── Fee gate ────────────────────────────────────────────────────────────────
    // Enrollment is allowed only when the student has paid at least one
    const publishedSemesterFee = await prisma.semesterFee.findFirst({
      where: {
        semesterId: offering.semesterId,
        status: "PUBLISHED",
      },
      select: { id: true },
    });

    if (!publishedSemesterFee) {
      return {
        status: "error",
        message:
          "Semester fee has not been published yet. Please contact the accounts office.",
      };
    }

    const studentInstallments = await prisma.studentFeeInstallment.findMany({
      where: {
        studentId: student.id,
        studentSemesterFee: {
          semesterFeeId: publishedSemesterFee.id,
        },
      },
      select: {
        status: true,
        dueDate: true,
      },
    });

    let hasAnyPaidInstallment = false;
    let hasOverdueUnpaidInstallment = false;

    if (studentInstallments.length > 0) {
      hasAnyPaidInstallment = studentInstallments.some(
        (installment) => installment.status === "PAID"
      );
      hasOverdueUnpaidInstallment = studentInstallments.some(
        (installment) =>
          installment.status === "UNPAID" && installment.dueDate < now
      );
    } else {
      const baseInstallments = await prisma.feeInstallment.findMany({
        where: { semesterFeeId: publishedSemesterFee.id },
        select: { dueDate: true },
      });

      hasAnyPaidInstallment = false;
      hasOverdueUnpaidInstallment = baseInstallments.some(
        (installment) => installment.dueDate < now
      );
    }

    if (!hasAnyPaidInstallment) {
      return {
        status: "error",
        message: hasOverdueUnpaidInstallment
          ? "You have unpaid overdue semester fee installments. Please clear at least one installment before enrolling in courses."
          : "Please pay at least one semester fee installment before enrolling in courses.",
      };
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_offeringId: {
          studentId: student.id,
          offeringId,
        },
      },
      select: { id: true, status: true },
    });

    if (
      existingEnrollment &&
      (existingEnrollment.status === EnrollmentStatus.ENROLLED ||
        existingEnrollment.status === EnrollmentStatus.APPROVED ||
        existingEnrollment.status === EnrollmentStatus.PENDING ||
        existingEnrollment.status === EnrollmentStatus.COMPLETED)
    ) {
      return {
        status: "error",
        message: "You are already enrolled in this course.",
      };
    }

    await prisma.enrollment.upsert({
      where: {
        studentId_offeringId: {
          studentId: student.id,
          offeringId,
        },
      },
      update: {
        registrationId: approvedRegistration.id,
        status: "ENROLLED",
      },
      create: {
        studentId: student.id,
        offeringId,
        registrationId: approvedRegistration.id,
        status: "ENROLLED",
      },
    });

    return {
      status: "success",
      message: "Course enrolled successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Something bad happened. Please try again.",
    };
  }
}

export async function dropCourse(offeringId: string): Promise<ApiResponseType> {
  try {
    const session = await requireStudentSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      subjectOfferings: ["list"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to drop courses.",
      };
    }

    const studentId = await getStudentIdByUserId(session.user.id);

    if (!studentId) {
      return {
        status: "error",
        message: "Student profile not found.",
      };
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_offeringId: {
          studentId,
          offeringId,
        },
      },
      select: {
        id: true,
        status: true,
        offering: {
          select: {
            semester: {
              select: {
                dropDeadline: true,
                lateDropDeadline: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return {
        status: "error",
        message: "Enrollment not found for this course.",
      };
    }

    if (enrollment.status !== "ENROLLED" && enrollment.status !== "PENDING") {
      return {
        status: "error",
        message: "This course cannot be dropped in its current state.",
      };
    }

    const semester = enrollment.offering.semester;
    if (!semester) {
      return {
        status: "error",
        message: "Semester information not found for this enrollment.",
      };
    }

    const now = new Date();
    const dropDeadlineEndOfDay = new Date(semester.dropDeadline);
    dropDeadlineEndOfDay.setHours(23, 59, 59, 999);
    const lateDropDeadlineEndOfDay = new Date(semester.lateDropDeadline);
    lateDropDeadlineEndOfDay.setHours(23, 59, 59, 999);

    const nextStatus =
      now <= dropDeadlineEndOfDay
        ? "DROPPED"
        : now <= lateDropDeadlineEndOfDay
          ? "WITHDRAWN"
          : null;

    if (!nextStatus) {
      return {
        status: "error",
        message: "Drop deadline has passed for this course.",
      };
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: nextStatus },
    });

    return {
      status: "success",
      message:
        nextStatus === "DROPPED"
          ? "Course dropped successfully."
          : "Course withdrawn successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Something bad happened. Please try again.",
    };
  }
}
