import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";

// Get students for a specific section assigned to the current professor
export async function getProfessorSectionStudents({
  section,
}: {
  section: string;
}) {
  const session = await requireProfessorSession();

  const students = await prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          offering: {
            section: section,
            teachingAssignments: {
              some: {
                professor: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      registrationNo: true,
      program: true,
      department: true,
      studentAttendances: {
        select: {
          status: true,
        },
      },
      registration: {
        select: {
          year: true,
          semester: true,
          batch: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return students;
}

export type ProfessorSectionStudents = Awaited<
  ReturnType<typeof getProfessorSectionStudents>
>[number];
