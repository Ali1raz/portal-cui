"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireStudentSession } from "@/app/data/student/require-student-session";
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
