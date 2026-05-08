"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireProfessorSession } from "@/app/data/professor/require-professor-session";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import type { AttendanceStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { AttendanceFormSchemaType } from "./zod-schema";

type AttendanceRecord = {
  registrationNo: string;
  status: AttendanceStatus;
};

/// Marks attendance for a subject offering session and validates enrollment.
export async function markAttendance({
  attendances,
  offeringId,
  values,
}: {
  offeringId: string;
  attendances: AttendanceRecord[];
  values: AttendanceFormSchemaType;
}): Promise<ApiResponseType> {
  try {
    if (!attendances.length) {
      return {
        status: "error",
        message: "No attendance entries provided.",
      };
    }

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    if (values.date > todayEnd) {
      return {
        status: "error",
        message: "Future dates are not allowed.",
      };
    }
    const session = await requireProfessorSession();

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      attendance: ["mark"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to mark attendance",
      };
    }

    // Fetch teaching assignment for this professor and offering in one query
    const teachingAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        offeringId: offeringId,
        professor: { userId: session.user.id },
      },
      select: { id: true, section: true },
    });

    if (!teachingAssignment) {
      return {
        status: "error",
        message: "No teaching assignment found for this offering.",
      };
    }

    // For each student, verify enrollment in the offering and section
    const regNos = Array.from(
      new Set(attendances.map((a) => a.registrationNo))
    );
    const enrollments = await prisma.enrollment.findMany({
      where: {
        offeringId: offeringId,
        section: teachingAssignment.section,
        student: { registrationNo: { in: regNos } },
      },
      select: {
        studentId: true,
        student: { select: { registrationNo: true } },
      },
    });

    const regNoToId = new Map(
      enrollments.map((e) => [e.student.registrationNo, e.studentId])
    );

    const validAttendances = attendances
      .map((a) => ({
        status: a.status,
        studentId: regNoToId.get(a.registrationNo) ?? null,
      }))
      .filter((a) => !!a.studentId);

    if (!validAttendances.length) {
      return {
        status: "error",
        message: "No enrolled students found for this offering/section.",
      };
    }

    const skipped = regNos.filter((regNo) => !regNoToId.has(regNo));

    // Check for existing attendance record with same date/time
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        offeringId: offeringId,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
      },
      select: { id: true },
    });

    if (existing) {
      return {
        status: "error",
        message: "Attendance already marked for this session.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const attendanceRecord = await tx.attendanceRecord.create({
        data: {
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          topic: values.topic,
          offeringId: offeringId,
        },
      });

      await tx.studentAttendance.createMany({
        data: validAttendances.map((a) => ({
          status: a.status,
          recordId: attendanceRecord.id,
          studentId: a.studentId as string,
        })),
      });
    });

    return {
      status: "success",
      message:
        skipped.length > 0
          ? `Attendance marked for ${validAttendances.length} students. Skipped: ${skipped.join(", ")}`
          : `Attendance marked for ${validAttendances.length} students`,
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

/// Updates an existing attendance record.
export async function updateAttendance({
  recordId,
  attendances,
  offeringId,
  values,
}: {
  recordId: string;
  offeringId: string;
  attendances: AttendanceRecord[];
  values: AttendanceFormSchemaType;
}): Promise<ApiResponseType> {
  try {
    if (!attendances.length) {
      return {
        status: "error",
        message: "No attendance entries provided.",
      };
    }

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    if (values.date > todayEnd) {
      return {
        status: "error",
        message: "Future dates are not allowed.",
      };
    }
    const session = await requireProfessorSession();

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      attendance: ["mark"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to mark attendance",
      };
    }

    // Fetch teaching assignment for this professor and offering
    const teachingAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        offeringId: offeringId,
        professor: { userId: session.user.id },
      },
      select: { id: true, section: true },
    });

    if (!teachingAssignment) {
      return {
        status: "error",
        message: "No teaching assignment found for this offering.",
      };
    }

    // Check if the record exists
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        id: recordId,
        offeringId: offeringId,
      },
      select: { id: true },
    });

    if (!existing) {
      return {
        status: "error",
        message: "Attendance record not found.",
      };
    }

    // For each student, verify enrollment in the offering and section
    const regNos = Array.from(
      new Set(attendances.map((a) => a.registrationNo))
    );
    const enrollments = await prisma.enrollment.findMany({
      where: {
        offeringId: offeringId,
        section: teachingAssignment.section,
        student: { registrationNo: { in: regNos } },
      },
      select: {
        studentId: true,
        student: { select: { registrationNo: true } },
      },
    });

    const regNoToId = new Map(
      enrollments.map((e) => [e.student.registrationNo, e.studentId])
    );

    const validAttendances = attendances
      .map((a) => ({
        status: a.status,
        studentId: regNoToId.get(a.registrationNo) ?? null,
      }))
      .filter((a) => !!a.studentId);

    if (!validAttendances.length) {
      return {
        status: "error",
        message: "No enrolled students found for this offering/section.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.attendanceRecord.update({
        where: { id: recordId },
        data: {
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          topic: values.topic,
        },
      });

      // Overwrite previous student attendances
      await tx.studentAttendance.deleteMany({
        where: { recordId: recordId },
      });

      await tx.studentAttendance.createMany({
        data: validAttendances.map((a) => ({
          status: a.status,
          recordId: recordId,
          studentId: a.studentId as string,
        })),
      });
    });

    return {
      status: "success",
      message: `Attendance updated for ${validAttendances.length} students`,
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message: errorMessage(error, "Could not update attendance."),
    };
  }
}
