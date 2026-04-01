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
        where: {
          status: {
            in: ["ENROLLED", "APPROVED", "PENDING"],
          },
        },
        select: {
          section: true,
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
                  section: true,
                  professor: {
                    select: {
                      user: {
                        select: {
                          name: true,
                          image: true,
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
        orderBy: {
          createdAt: "desc",
        },
        select: {
          semester: {
            select: {
              semester: true,
              year: true,
              batch: true,
            },
          },
          createdAt: true,
        },
      },
    },
  });

  if (!data) {
    return null;
  }

  const enrollmentsWithTeacher = data.enrollments.map((enrollment) => {
    const enrollmentSection = enrollment.section ?? "A";
    const assignedTeacher = enrollment.offering.teachingAssignments.find(
      (assignment) => (assignment.section ?? "A") === enrollmentSection
    );

    return {
      ...enrollment,
      teacherName: assignedTeacher?.professor.user.name ?? "TBA",
    };
  });

  return {
    ...data,
    enrollments: enrollmentsWithTeacher,
  };
}

export type StudentRegistrationDetails = Awaited<
  ReturnType<typeof getStudentRegistrationDetails>
>;
