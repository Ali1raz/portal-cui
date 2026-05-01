import "server-only";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";

/// Fetch one semester fee for edit-installments page with existing installments.
export async function accountantGetFeeForEditInstallments(feeId: string) {
  const session = await requireSession();

  const can = await requirePermission({
    fee: ["update"],
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
      semester: {
        select: {
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
          installmentNo: true,
          amount: true,
          dueDate: true,
          description: true,
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

export type AccountantGetFeeForEditInstallmentsType = Awaited<
  ReturnType<typeof accountantGetFeeForEditInstallments>
>;
