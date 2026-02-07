import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import "server-only";

export async function getSubjectDetails(subjectId: string) {
  const subject = await prisma.subject.findFirst({
    where: {
      id: subjectId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      creditHours: true,
      offerings: {
        select: {
          id: true,
          semester: true,
          section: true,
          department: true,
          totalLectures: true,
          year: true,
          teachingAssignments: {
            select: {
              professor: {
                select: {
                  id: true,
                  employeeNo: true,
                  department: true,
                  user: {
                    select: {
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },

          _count: {
            select: {
              enrollments: true,
              teachingAssignments: true,
            },
          },
        },
      },
    },
  });

  const assignemnts = await prisma.teachingAssignment.findMany({
    where: {
      offering: {
        subjectId: subjectId,
      },
    },
    select: {
      id: true,
      professor: {
        select: {
          id: true,
          employeeNo: true,
          department: true,

          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!subject) {
    return notFound();
  }

  return { subject, assignemnts };
}
