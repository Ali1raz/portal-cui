import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

export async function getLeaveRequests() {
  const session = await requireSession();
  const can = await requirePermission({
    leaveRequest: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const hod = await prisma.hod.findUnique({
    where: { userId: session.user.id },
    select: { department: true },
  });

  if (!hod) {
    throw new Error("HOD not found");
  }

  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING",
      student: {
        department: hod?.department,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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
      student: {
        select: {
          registrationNo: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return requests;
}

export type GetLeaveRequestsType = Awaited<
  ReturnType<typeof getLeaveRequests>
>[number];
