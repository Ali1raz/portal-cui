import "server-only";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";

/// Fetch complaint details for the current student.
export async function studentGetComplaintDetails({ id }: { id: string }) {
  const session = await requireSession();
  const can = await requirePermission({
    complaints: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const details = await prisma.complaint.findUnique({
    where: {
      id,
      studentId: student.id,
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
      hodRemarks: true,
      baReviewedAt: true,
      baRemarks: true,
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
          // Actor details
          // BA details if actor is BA
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
          fromDepartment: true,
          toDepartment: true,
          reason: true,
          assignedAt: true,
        },
      },

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
  });

  if (!details) {
    return notFound();
  }

  return details;
}

export type StudentComplaintDetails = Awaited<
  ReturnType<typeof studentGetComplaintDetails>
>;
