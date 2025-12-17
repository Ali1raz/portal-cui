"use server";

import { requireProfessorSession } from "@/app/data/professor/require-professor-session";
import type { AttendanceStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

type AttendanceRecord = {
  registrationNo: string;
  status: AttendanceStatus;
};

export async function markAttendance(data: {
  topic: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendances: AttendanceRecord[];
}): Promise<ApiResponseType> {
  try {
    console.log(data.date, data.startTime, data.endTime);
    const session = await requireProfessorSession();

    const teachingAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        professor: { userId: session.user.id },
      },
      include: { offering: true },
    });
    if (!teachingAssignment) {
      return {
        status: "error",
        message: "No teaching assignment found for this professor.",
      };
    }
    const offeringId = teachingAssignment.offeringId;

    // Create AttendanceRecord
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        topic: data.topic,
        offeringId,
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
