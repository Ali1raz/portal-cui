import prisma from "@/lib/prisma";
import "server-only";

export async function adminGetAllSubjects() {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      code: true,
      creditHours: true,
      name: true,
      offerings: {
        select: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
  });

  return subjects;
}

export type AdminGetAllSubjectsType = Awaited<
  ReturnType<typeof adminGetAllSubjects>
>[number];
