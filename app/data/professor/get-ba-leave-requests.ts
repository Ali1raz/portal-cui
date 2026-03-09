import "server-only";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function baGetAllLeaveRequests() {
  const can = await requirePermission({
    leaveRequest: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }
  const requests = await prisma.complaint.findMany({
    where: {
      //   status: "BA_PENDING",
    },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      createdAt: true,
      imageKey: true,
      student: {
        select: {
          registrationNo: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return requests;
}
