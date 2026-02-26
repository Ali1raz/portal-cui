import prisma from "@/lib/prisma";
import "server-only";
import { requirePermission } from "../permission/require-permission";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "../session/require-session";

export async function studentGetSubjectOverview({
  offeringId,
}: {
  offeringId: string;
}) {
  const session = await requireSession();
  const can = await requirePermission({
    subject: ["get:registered"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const subj = await prisma.subjectOffering.findFirst({
    where: {
      id: offeringId,
      enrollments: {
        some: { studentId: student.id },
      },
    },
    select: {
      _count: {
        select: {
          leaveRequests: true,
        },
      },
      totalLectures: true,
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          creditHours: true,
        },
      },
    },
  });

  if (!subj) {
    return notFound();
  }

  // Fetch attendance statistics
  const [totalRecords, presentCount, absentCount] = await Promise.all([
    prisma.studentAttendance.count({
      where: {
        studentId: student.id,
        record: { offeringId },
      },
    }),
    prisma.studentAttendance.count({
      where: {
        studentId: student.id,
        record: { offeringId },
        status: "PRESENT",
      },
    }),
    prisma.studentAttendance.count({
      where: {
        studentId: student.id,
        record: { offeringId },
        status: "ABSENT",
      },
    }),
  ]);

  return {
    ...subj,
    attendanceStats: {
      totalRecords,
      presentCount,
      absentCount,
    },
  };
}
