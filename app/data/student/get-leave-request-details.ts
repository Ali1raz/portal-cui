import "server-only";
import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";
import { requirePermission } from "../permission/require-permission";
import { redirect, notFound } from "next/navigation";

/// Fetch student leave request details with reviews for detail page.
export async function getStudentLeaveRequestDetails({ id }: { id: string }) {
  const session = await requireStudentSession();

  const can = await requirePermission({
    leaveRequest: ["get"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

  const details = await prisma.leaveRequest.findFirst({
    where: {
      id,
      student: { userId: session.user.id },
    },
    select: {
      id: true,
      date: true,
      reasonTitle: true,
      reasonDetails: true,
      imageKey: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { reviews: true } },
      offering: {
        select: {
          id: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  if (!details) {
    return notFound();
  }

  return details;
}

export type StudentLeaveRequestDetails = Awaited<
  ReturnType<typeof getStudentLeaveRequestDetails>
>;
