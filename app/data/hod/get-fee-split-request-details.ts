import "server-only";

import { redirect } from "next/navigation";
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
    fee: ["view"],
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

  const request = await prisma.installmentSplitRequest.findFirst({
    where: {
      id: requestId,
      student: {
        department: hod.department,
      },
    },
    select: {
      id: true,
      requestedAmount: true,
      preferredDueDate: true,
      reason: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      student: {
        select: {
          registrationNo: true,
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      feeInstallment: {
        select: {
          id: true,
          installmentNo: true,
          amount: true,
          dueDate: true,
          description: true,
          semesterFee: {
            select: {
              id: true,
              totalAmount: true,
              description: true,
              semester: {
                select: {
                  semester: true,
                  year: true,
                  batch: true,
                  program: true,
                  department: true,
                },
              },
            },
          },
        },
      },
      studentFeeInstallment: {
        select: {
          id: true,
          orderNo: true,
          amount: true,
          dueDate: true,
          status: true,
          semesterFee: {
            select: {
              id: true,
              totalAmount: true,
              semester: {
                select: {
                  semester: true,
                  year: true,
                  batch: true,
                  program: true,
                  department: true,
                },
              },
            },
          },
        },
      },
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          actorRole: true,
          actorId: true,
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

  if (!request) {
    return redirect("/unauthorized");
  }

  return {
    ...request,
    requestedAmount: Number(request.requestedAmount),
    feeInstallment: request.feeInstallment
      ? {
          ...request.feeInstallment,
          amount: Number(request.feeInstallment.amount),
          semesterFee: {
            ...request.feeInstallment.semesterFee,
            totalAmount: Number(request.feeInstallment.semesterFee.totalAmount),
          },
        }
      : null,
    studentFeeInstallment: request.studentFeeInstallment
      ? {
          ...request.studentFeeInstallment,
          amount: Number(request.studentFeeInstallment.amount),
          semesterFee: {
            ...request.studentFeeInstallment.semesterFee,
            totalAmount: Number(
              request.studentFeeInstallment.semesterFee.totalAmount
            ),
          },
        }
      : null,
  };
}
