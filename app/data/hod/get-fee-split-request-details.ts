import "server-only";

import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";

/// Fetch one fee split request detail for HOD review with department-level access guard.
export async function hodGetFeeSplitRequestDetails({
  requestId,
}: {
  requestId: string;
}) {
  const session = await requireSession();

  const can = await requirePermission({
    installments: ["view"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const hod = await prisma.hod.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      department: true,
    },
  });

  if (!hod) {
    return redirect("/unauthorized");
  }

  const req = await prisma.installmentSplitRequest.findFirst({
    where: {
      id: requestId,
      student: {
        department: hod.department,
      },
    },
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      preferredDueDate: true,
      requestedAmount: true,
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          remarks: true,
          createdAt: true,
          action: true,
          actorRole: true,
          fromStatus: true,
          toStatus: true,
        },
      },
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
      studentFeeInstallment: {
        select: {
          studentSemesterFee: {
            select: {
              totalDue: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!req) {
    return notFound();
  }

  return {
    ...req,
    totalFee: Number(req.studentFeeInstallment?.studentSemesterFee?.totalDue),
    requestedAmount: Number(req.requestedAmount),
  };
}
