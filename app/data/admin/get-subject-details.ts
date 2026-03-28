import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import "server-only";

export async function getSubjectDetails(subjectId: string) {
  const subj = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
    select: {
      id: true,
    },
  });

  if (!subj) return notFound();

  const subject = await prisma.subject.findFirst({
    where: {
      id: subj.id,
    },
    select: {
      id: true,
      name: true,
      code: true,
      creditHours: true,
      offerings: {
        select: {
          id: true,
          department: true,
          totalLectures: true,
          semester: {
            select: {
              semester: true,
              year: true,
            },
          },
          teachingAssignments: {
            // distinct: "section",
            select: {
              section: true,
              professor: {
                select: {
                  id: true,
                  employeeNo: true,
                  department: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
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

  if (!subject) return notFound();

  const assignemnts = await prisma.teachingAssignment.findMany({
    where: {
      offering: {
        subjectId: subj.id,
      },
    },
    select: {
      id: true,
      section: true,
      professor: {
        select: {
          id: true,
          employeeNo: true,
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return { subject, assignemnts };
}
