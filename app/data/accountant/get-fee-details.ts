import "server-only";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";

/// Fetch one semester fee for the details page, scoped to current accountant.
export async function accountantGetFeeDetails(feeId: string) {
  const session = await requireSession();

  const can = await requirePermission({
    fee: ["view"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const accountant = await prisma.accountant.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!accountant) {
    return redirect("/unauthorized");
  }

  const fee = await prisma.semesterFee.findFirst({
    where: {
      id: feeId,
      accountantId: accountant.id,
    },
    select: {
      id: true,
      totalAmount: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      semester: {
        select: {
          id: true,
          semester: true,
          batch: true,
          year: true,
          program: true,
          department: true,
        },
      },
      feeInstallments: {
        orderBy: {
          installmentNo: "asc",
        },
        select: {
          id: true,
          installmentNo: true,
          amount: true,
          dueDate: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!fee) {
    return redirect("/accountant/manage-fee");
  }

  return {
    ...fee,
    totalAmount: fee.totalAmount.toNumber(),
    feeInstallments: fee.feeInstallments.map((installment) => ({
      ...installment,
      amount: installment.amount.toNumber(),
    })),
  };
}

export type AccountantGetFeeDetailsType = Awaited<
  ReturnType<typeof accountantGetFeeDetails>
>;
