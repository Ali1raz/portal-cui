import "server-only";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";

export async function hodGetFeeForEditInstallments() {
  const session = await requireSession();

  const can = await requirePermission({
    fee: ["update"],
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

  const fee = await prisma.semesterFee.findFirst({
    where: {
      semester: {
        department: hod.department,
      },
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
    return redirect("/hod/fee");
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

export type HodGetFeeForEditInstallmentsType = Awaited<
  ReturnType<typeof hodGetFeeForEditInstallments>
>;
