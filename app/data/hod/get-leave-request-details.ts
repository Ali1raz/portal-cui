import "server-only";
import { requireHodSession } from "./require-hod-session";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

export async function getLeaveRequestDetails(requestId: string) {
  const session = await requireHodSession();

  const can = await requirePermission({
    leaveRequest: ["get"],
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

  const request = await prisma.leaveRequest.findFirst({
    where: {
      status: "PENDING",
      id: requestId,
      student: {
        department: hod.department,
      },
    },
    select: {
      id: true,
      date: true,
      reasonTitle: true,
      status: true,
      imageKey: true,
      reasonDetails: true,
      createdAt: true,
      offering: {
        select: {
          department: true,
          totalLectures: true,
          subject: {
            select: {
              name: true,
              code: true,
              creditHours: true,
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

  return request;
}
