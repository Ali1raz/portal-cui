import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";

export async function getStudentSubjects() {
  const session = await requireStudentSession();

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      enrollments: {
        include: {
          offering: {
            include: {
              subject: true,
              teachingAssignments: {
                include: {
                  professor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    return [];
  }

  return student.enrollments.map((enrollment) => {
    const offering = enrollment.offering;
    const subject = offering.subject;

    // Now using the [0] index safely because we enforced single-professor per section in schema
    const teacher =
      offering.teachingAssignments[0]?.professor.user.name ?? "TBA";

    return {
      code: subject.code,
      name: subject.name,
      creditHours: subject.creditHours,
      teacherName: teacher,
      className: `${offering.department}-${offering.section}`, // "CS-A"
    };
  });
}

export type StudentSubject = Awaited<
  ReturnType<typeof getStudentSubjects>
>[number];
