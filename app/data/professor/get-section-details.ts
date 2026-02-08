import "server-only";

import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";

export async function getSectionDetails(section: string) {
  const session = await requireProfessorSession();

  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: {
      AND: [{ professor: { userId: session.user.id } }, { section: section }],
    },
    select: {
      section: true,
      offering: {
        include: {
          subject: {
            select: {
              code: true,
              name: true,
              creditHours: true,
            },
          },
          enrollments: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  // get enrollments count
  if (!teachingAssignment) {
    return null;
  }

  return {
    totalStudents: teachingAssignment.offering.enrollments.length,
    subject: teachingAssignment.offering.subject,
    section: teachingAssignment.section,
    semester: teachingAssignment.offering.semester,
  };
}
