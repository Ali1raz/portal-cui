import "server-only";

import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

/// Fetch leave request details for the batch advisor details page.
export async function baGetLeaveRequestDetails({ id }: { id: string }) {
  const session = await requireSession();

  const can = await requirePermission({
    leaveRequest: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const ba = await prisma.batchAdvisor.findUnique({
    where: { userId: session.user.id },
    select: { department: true },
  });

  if (!ba) {
    return redirect("/unauthorized");
  }

  const details = await prisma.leaveRequest.findFirst({
    where: {
      id,
      student: {
        department: ba.department,
      },
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
      offering: {
        select: {
          id: true,
          department: true,
          totalLectures: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              creditHours: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          registrationNo: true,
          department: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      reviews: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          actorRole: true,
          action: true,
          remarks: true,
          fromStatus: true,
          toStatus: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!details) {
    return notFound();
  }

  return details;
}

export type BaLeaveRequestDetails = Awaited<
  ReturnType<typeof baGetLeaveRequestDetails>
>;
