import "server-only";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";

export async function getStudentLeaveRequests() {
  const session = await requireStudentSession();

  const requests = await prisma.leaveRequest.findMany({
    where: {
      student: { userId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      date: true,
      reasonTitle: true,
      status: true,
      createdAt: true,
      offering: {
        select: {
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  return requests;
}

export type StudentLeaveRequest = Awaited<
  ReturnType<typeof getStudentLeaveRequests>
>[number];
