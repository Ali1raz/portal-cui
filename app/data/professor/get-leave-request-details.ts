import "server-only";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function professorGetLeaveRequestDetails({ id }: { id: string }) {
  const session = await requireSession();

  const can = await requirePermission({
    leaveRequest: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const prof = await prisma.professor.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!prof) {
    return redirect("/unauthorized");
  }

  const details = await prisma.leaveRequest.findUnique({
    where: {
      id,
      offering: {
        teachingAssignments: {
          some: {
            professorId: prof.id,
          },
        },
      },
    },

    select: {
      id: true,
      date: true,
      reasonTitle: true,
      reasonDetails: true,
      createdAt: true,
      imageKey: true,
      status: true,
      student: {
        select: {
          _count: {
            select: { leaveRequests: true },
          },
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

  if (!details) {
    return notFound();
  }

  return details;
}
