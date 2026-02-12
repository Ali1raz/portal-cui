import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "@/app/data/session/require-session";
import { redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

export async function getStudentAttendances(opts: { offeringId: string }) {
  const session = await requireSession();
  const can = await requirePermission({
    attendance: ["list"],
  });

  if (!can) {
    redirect("/unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!student) {
    redirect("/unauthorized");
  }

  const { offeringId } = opts;

  const records = await prisma.studentAttendance.findMany({
    where: {
      studentId: student.id,
      record: {
        offeringId,
      },
    },
    // orderBy,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
      record: {
        select: {
          date: true,
          startTime: true,
          endTime: true,
          topic: true,
        },
      },
    },
  });

  return records;
}

export type StudentGetAttendencesType = Awaited<
  ReturnType<typeof getStudentAttendances>
>[number];
