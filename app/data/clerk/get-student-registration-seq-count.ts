import "server-only";

import prisma from "@/lib/prisma";
import { Batch, Department } from "@/lib/generated/prisma/enums";

type GetStudentRegistrationSeqCountInput = {
  batch: Batch;
  year: number;

  department: Department;
};

export async function getStudentRegistrationSeqCount({
  batch,
  year,

  department,
}: GetStudentRegistrationSeqCountInput) {
  const registrationCount = await prisma.registration.count({
    where: {
      semester: {
        year,
        department,
        batch,
      },
    },
  });

  return registrationCount + 1;
}
