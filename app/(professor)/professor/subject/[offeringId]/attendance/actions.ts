"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireProfessorSession } from "@/app/data/professor/require-professor-session";
import { errorMessage } from "@/lib/error-message";
import type { AttendanceStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

type AttendanceRecord = {
  registrationNo: string;
  status: AttendanceStatus;
};

/// Marks attendance for a subject offering session and validates enrollment.
export async function markAttendance(data: {
  offeringId: string;
  topic: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendances: AttendanceRecord[];
}): Promise<ApiResponseType> {
  try {
    if (!data.attendances.length) {
      return {
        status: "error",
        message: "No attendance entries provided.",
      };
    }

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    if (data.date > todayEnd) {
      return {
        status: "error",
        message: "Future dates are not allowed.",
      };
    }
    const session = await requireProfessorSession();

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
        offeringId: data.offeringId,
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

    const sessionDate = data.date; // already a Date

    // For each student, verify enrollment in the offering and section
    const regNos = Array.from(
      new Set(data.attendances.map((a) => a.registrationNo))
    );
    const enrollments = await prisma.enrollment.findMany({
      where: {
        offeringId: data.offeringId,
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

    const validAttendances = data.attendances
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

    await prisma.$transaction(async (tx) => {
      // check existing record inside the transaction to reduce race window
      const existing = await tx.attendanceRecord.findFirst({
        where: {
          offeringId: data.offeringId,
          date: sessionDate,
          startTime: data.startTime,
          endTime: data.endTime,
        },
        select: { id: true },
      });

      if (existing) {
        return {
          status: "error",
          message: "Attendance already marked for this session.",
        };
      }

      const attendanceRecord = await tx.attendanceRecord.create({
        data: {
          date: sessionDate,
          startTime: data.startTime,
          endTime: data.endTime,
          topic: data.topic,
          offeringId: data.offeringId,
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
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
