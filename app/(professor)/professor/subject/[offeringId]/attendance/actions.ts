"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireProfessorSession } from "@/app/data/professor/require-professor-session";
import type { AttendanceStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

type AttendanceRecord = {
  registrationNo: string;
  status: AttendanceStatus;
};

export async function markAttendance(data: {
  offeringId: string;
  topic: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendances: AttendanceRecord[];
}): Promise<ApiResponseType> {
  try {
    const can = await requirePermission({
      attendance: ["mark", "view"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to mark attendance",
      };
    }
    const session = await requireProfessorSession();
    const professor = await prisma.professor.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!professor) {
      return {
        status: "error",
        message: "No professor record found for this user.",
      };
    }

    const teachingAssignment = await prisma.teachingAssignment.findUnique({
      where: {
        professorId_offeringId: {
          offeringId: data.offeringId,
          professorId: professor.id,
        },
      },
      select: { id: true },
    });

    if (!teachingAssignment) {
      return {
        status: "error",
        message: "No teaching assignment found for this offering.",
      };
    }

    // Create AttendanceRecord
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        topic: data.topic,
        offeringId: data.offeringId,
      },
    });

    // For each student, find studentId by registrationNo
    const regNos = data.attendances.map((a) => a.registrationNo);
    const students = await prisma.student.findMany({
      where: { registrationNo: { in: regNos } },
      select: { id: true, registrationNo: true },
    });
    const regNoToId: Record<string, string> = {};
    students.forEach((s) => {
      regNoToId[s.registrationNo] = s.id;
    });

    // Create StudentAttendance for each
    const studentAttendances = data.attendances.map((a) => ({
      status: a.status,
      recordId: attendanceRecord.id,
      studentId: regNoToId[a.registrationNo],
    }));

    // Filter out any missing students
    const validAttendances = studentAttendances.filter((a) => !!a.studentId);

    await prisma.$transaction(
      validAttendances.map((a) => prisma.studentAttendance.create({ data: a }))
    );

    return {
      status: "success",
      message: `Attendance marked for ${validAttendances.length} students`,
    };
  } catch {
    return {
      status: "error",
      message: "Failed to mark attendance",
    };
  }
}
