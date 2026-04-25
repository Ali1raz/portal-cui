import "server-only";

import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";

export async function studentGetFeeInstallmentOptions() {
  const can = await requirePermission({
    fee: ["view"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const session = await requireSession();

  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    return [];
  }

  const semesterFees = await prisma.semesterFee.findMany({
    where: {
      status: "PUBLISHED",
      semester: {
        registrations: {
          some: {
            studentId: student.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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
      feeInstallments: {
        // take: 1,
        orderBy: {
          installmentNo: "asc",
        },

        select: {
          id: true,
          installmentNo: true,
          amount: true,
          dueDate: true,
        },
      },
    },
  });

  return semesterFees.flatMap((semesterFee) => {
    const semester = semesterFee.semester;
    const semesterLabel = `Sem ${semester.semester} (${semester.batch}${semester.year
      .toString()
      .slice(-2)}-${semester.program}${semester.department})`;

    return semesterFee.feeInstallments.map((installment) => ({
      feeInstallmentId: installment.id,
      semesterFeeId: semesterFee.id,
      installmentNo: installment.installmentNo,
      amount: Number(installment.amount),
      totalAmount: Number(semesterFee.totalAmount),
      dueDate: installment.dueDate.toISOString(),
      semesterLabel,
    }));
  });
}

export type StudentInstallmentSplitOption = Awaited<
  ReturnType<typeof studentGetFeeInstallmentOptions>
>[number];
