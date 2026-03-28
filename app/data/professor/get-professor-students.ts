import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

/// Get students for a specific offering assigned to the current professor
export async function getProfessorSectionStudents({
  offeringId,
}: {
  offeringId: string;
}) {
  const session = await requireProfessorSession();
  const can = await requirePermission({
    user: ["list"],
    attendance: ["mark"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const professor = await prisma.professor.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!professor) {
    return redirect("/unauthorized");
  }

  const [teachingAssignment, totalLectures] = await Promise.all([
    prisma.teachingAssignment.findFirst({
      where: {
        offeringId,
        professorId: professor.id,
      },
      select: {
        id: true,
        section: true, // ✅ needed to scope student query to the professor's section
      },
    }),
    prisma.attendanceRecord.count({
      where: {
        offeringId,
      },
    }),
  ]);

  if (!teachingAssignment) {
    return redirect("/unauthorized");
  }

  const students = await prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          offeringId: offeringId,
          section: teachingAssignment.section,
          offering: {
            teachingAssignments: {
              some: {
                AND: [{ professorId: professor.id }],
              },
            },
          },
        },
      },
    },
    orderBy: {
      registrationNo: "asc",
    },
    select: {
      id: true,
      registrationNo: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      leaveRequests: {
        where: {
          offeringId,
        },
        select: {
          id: true,
          date: true,
          reasonTitle: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (students.length === 0) {
    return [];
  }

  const studentIds = students.map((student) => student.id);

  const presentCounts = await prisma.studentAttendance.groupBy({
    by: ["studentId"],
    _count: {
      _all: true,
    },
    where: {
      studentId: { in: studentIds },
      status: "PRESENT",
      record: {
        offeringId,
      },
    },
  });

  const presentCountMap = new Map(
    presentCounts.map((entry) => [entry.studentId, entry._count._all])
  );

  return students.map((student) => {
    const presentCount = presentCountMap.get(student.id) ?? 0;
    const percentage =
      totalLectures > 0 ? (presentCount / totalLectures) * 100 : 0;
    const pendingLeaveRequest = student.leaveRequests[0] ?? null;

    return {
      ...student,
      attendancePercentage: Math.round(percentage * 100) / 100,
      pendingLeaveRequest,
    };
  });
}

export type ProfessorSectionStudents = Awaited<
  ReturnType<typeof getProfessorSectionStudents>
>[number];
