import "server-only";

import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";

export async function studentGetFeeDetails() {
  const can = await requirePermission({
    fee: ["view"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const session = await requireSession();

  const data = await prisma.semesterFee.findFirst({
    where: {
      status: "PUBLISHED",
      semester: {
        registrations: {
          some: {
            student: {
              userId: session.user.id,
            },
          },
        },
      },
    },

    select: {
      id: true,
      _count: {
        select: {
          feeInstallments: true,
        },
      },
      totalAmount: true,
      feeInstallments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          installmentNo: true,
          updatedAt: true,
        },
      },
    },
  });

  return data;
}
