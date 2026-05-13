import "server-only";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "../session/require-session";

/// Fetch complaint details for Batch Advisor from their department.
export async function baGetComplaintDetails({ id }: { id: string }) {
  const session = await requireSession();

  const ba = await prisma.professor.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      department: true,
      batchAdvisor: { select: { id: true } },
    },
  });

  if (!ba?.batchAdvisor || !ba.department) {
    return redirect("/unauthorized");
  }

  const details = await prisma.complaint.findFirst({
    where: {
      id,
      student: {
        department: ba.department,
      },
    },
    select: {
      id: true,
      title: true,
      details: true,
      category: true,
      status: true,
      targetDepartment: true,
      createdAt: true,
      imageKey: true,
      student: {
        select: {
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
      _count: { select: { reviews: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          actorRole: true,
          remarks: true,
          fromStatus: true,
          toStatus: true,
          actorId: true,
          action: true,
          department: true,
          createdAt: true,
          batchAdvisor: {
            select: {
              id: true,
              department: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
        },
      },
      assignments: {
        orderBy: { assignedAt: "desc" },
        select: {
          id: true,
          toDepartment: true,
          reason: true,
          assignedAt: true,
        },
      },
    },
  });

  if (!details) {
    return notFound();
  }

  return details;
}

export type BaComplaintDetails = Awaited<
  ReturnType<typeof baGetComplaintDetails>
>;
