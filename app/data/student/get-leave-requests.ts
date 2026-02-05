import "server-only";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

export async function getStudentLeaveRequests() {
  const session = await requireStudentSession();

  const can = await requirePermission({
    leaveRequest: ["list", "get"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

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
