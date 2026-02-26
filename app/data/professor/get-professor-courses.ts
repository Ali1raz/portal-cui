import "server-only";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireProfessorSession } from "./require-professor-session";
import { requirePermission } from "../permission/require-permission";

export async function getProfessorSubjects() {
  const session = await requireProfessorSession();
  const can = await requirePermission({
    subject: ["list"],
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
      employeeNo: true,
      createdAt: true,
      department: true,
      user: {
        select: {
          name: true,
          role: true,
          image: true,
          id: true,
          email: true,
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
      section: true,
      offering: {
        select: {
          id: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              creditHours: true,
            },
          },
          semester: true,
        },
      },
    },
  });

  return {
    assignments: assignments,
    professor: professor,
  };
}

export type ProfessorSubjects = NonNullable<
  Awaited<ReturnType<typeof getProfessorSubjects>>
>;
