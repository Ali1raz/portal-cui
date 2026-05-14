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

  // Fetch attendance statistics for every lecture and map missing records as ABSENT.
  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: {
      offeringId,
    },
    select: {
      attendances: {
        where: { studentId: student.id },
        select: { status: true },
      },
    },
  });

  const totalRecords = attendanceRecords.length;
  const { presentCount, absentCount, leaveCount } = attendanceRecords.reduce(
    (counts, record) => {
      const status = record.attendances[0]?.status;

      if (status === "PRESENT") {
        counts.presentCount += 1;
        return counts;
      }

      if (status === "LEAVE") {
        counts.leaveCount += 1;
        return counts;
      }

      // Missing attendance entries are treated as absent.
      counts.absentCount += 1;
      return counts;
    },
    {
      presentCount: 0,
      absentCount: 0,
      leaveCount: 0,
    }
  );

  return {
    ...subj,
    attendanceStats: {
      totalRecords,
      presentCount,
      absentCount,
      leaveCount,
    },
  };
}
