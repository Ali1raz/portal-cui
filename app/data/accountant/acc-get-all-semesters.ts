import "server-only";

import prisma from "@/lib/prisma";

export async function accountantGetAllSemesters() {
  const data = await prisma.semester.findMany({
    select: {
      id: true,
      batch: true,
      department: true,
      program: true,
      semester: true,
      year: true,
    },
  });

  return data;
}

export type AccountantGetAllSemestersType = Awaited<
  ReturnType<typeof accountantGetAllSemesters>
>;
