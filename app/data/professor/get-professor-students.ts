import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

// Get students for a specific section assigned to the current professor
export async function getProfessorSectionStudents({
  section,
}: {
  section: string;
}) {
  const session = await requireProfessorSession();
  const can = await requirePermission({
    user: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const professor = await prisma.professor.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!professor) {
    return redirect("/unauthorized");
  }

  // Step 1: Get all students for the professor and section
  const students = await prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          offering: {
            teachingAssignments: {
              some: {
                AND: [{ professorId: professor.id }, { section: section }],
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
    },
  });

  // Step 2: For each student, get attendance records for offerings in this section taught by this professor
  // Get all relevant offeringIds
  const offerings = await prisma.subjectOffering.findMany({
    where: {
      teachingAssignments: {
        some: {
          AND: [{ professorId: professor.id }, { section: section }],
        },
      },
    },
    select: {
      id: true,
      totalLectures: true,
    },
  });

  const offeringIds = offerings.map((o) => o.id);
  const totalLectures = offerings.reduce((sum, o) => sum + o.totalLectures, 0);

  const result = await Promise.all(
    students.map(async (student) => {
      const presentCount = await prisma.studentAttendance.count({
        where: {
          studentId: student.id,
          record: {
            offeringId: { in: offeringIds },
          },
          status: "PRESENT",
        },
      });
      const percentage =
        totalLectures > 0 ? (presentCount / totalLectures) * 100 : 0;
      return {
        ...student,
        attendancePercentage: Math.round(percentage * 100) / 100, // 2 decimal places
      };
    })
  );

  return result;
}

export type ProfessorSectionStudents = Awaited<
  ReturnType<typeof getProfessorSectionStudents>
>[number];
