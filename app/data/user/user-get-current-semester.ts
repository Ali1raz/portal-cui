import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";

export async function getCurrentSemester() {
  const sessiop = await requireSession();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentSemesters = await prisma.semester.findMany({
    where: {
      isActive: true,
      year: currentYear,
      registrationStart: {
        lte: currentDate,
      },
      registrationEnd: {
        gte: currentDate,
      },
    },
    select: {
      id: true,
      _count: { select: { registrations: true, studentApplications: true } },
      // batch: true,
      semester: true,
      registrationEnd: true,
      department: true,
    },
  });

  const activeApplications = await prisma.studentApplication.findFirst({
    where: {
      userId: sessiop.user.id,
      status: {
        in: ["APPROVED", "PENDING", "REVIEW_REQUESTED"],
      },
    },
  });
  return { currentSemesters, activeApplications };
}
