import "server-only";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";
import { redirect } from "next/navigation";

export async function getStudentEnrolledSubjects() {
  const session = await requireStudentSession();

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      offerings: {
        some: {
          enrollments: {
            some: {
              studentId: student?.id,
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  return {
    subjects,
    studentId: student.id,
  };
}

export type StudentEnrolledSubject = Awaited<
  ReturnType<typeof getStudentEnrolledSubjects>
>;
