import "server-only";
import { requireStudentSession } from "./require-student-session";
import prisma from "@/lib/prisma";
export async function getStudentRegistrationDetails() {
  const session = await requireStudentSession();

  const data = await prisma.student.findFirst({
    where: {
      userId: session.user.id,
    },
    select: {
      registrationNo: true,
      department: true,
      program: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      enrollments: {
        select: {
          offering: {
            select: {
              subject: {
                select: {
                  code: true,
                  name: true,
                  creditHours: true,
                },
              },
              teachingAssignments: {
                select: {
                  professor: {
                    select: {
                      user: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      registration: {
        select: {
          batch: true,
          semester: {
            select: {
              semester: true,
              year: true,
            },
          },
          createdAt: true,
        },
      },
    },
  });

  return data;
}

export type StudentRegistrationDetails = Awaited<
  ReturnType<typeof getStudentRegistrationDetails>
>;
