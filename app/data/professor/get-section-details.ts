import "server-only";

import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";

export async function getSectionDetails(section: string) {
  const session = await requireProfessorSession();

  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: {
      professor: {
        userId: session.user.id, // Match by user ID (professor's user)
      },
      offering: {
        section: section, // Match by section name
      },
    },
    include: {
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
    section: teachingAssignment.offering.section,
    semester: teachingAssignment.offering.semester,
  };
}
