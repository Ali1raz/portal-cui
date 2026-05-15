import "server-only";
import { requireStudentSession } from "./require-student-session";
import prisma from "@/lib/prisma";

export async function studentGetEnrollemntLastDate() {
  const session = await requireStudentSession();

  const date = await prisma.semester.findFirst({
    where: {
      registrations: {
        some: {
          student: {
            userId: session.user.id,
          },
        },
      },
    },
    select: {
      enrollmentEnd: true,
    },
  });

  return date?.enrollmentEnd;
}
