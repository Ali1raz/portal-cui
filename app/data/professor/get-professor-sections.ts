import "server-only";

import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";
import { redirect } from "next/navigation";

export async function getProfessorSections() {
  const session = await requireProfessorSession();

  const professor = await prisma.professor.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!professor) {
    return redirect("/unauthorized");
  }

  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      professorId: professor.id,
    },
    select: {
      id: true,
      offering: {
        select: {
          subject: {
            select: {
              code: true,
              name: true,
              creditHours: true,
            },
          },
          section: true,
          semester: true,
        },
      },
    },
  });

  return {
    assignments: assignments,
    professor: professor,
    subjects: assignments.map((assignment) => assignment.offering.subject),
  };
}

export type ProfessorSections = NonNullable<
  Awaited<ReturnType<typeof getProfessorSections>>
>;
