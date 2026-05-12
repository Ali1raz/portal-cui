import { Prisma } from "../generated/prisma/client";

export interface FeeInstallmentSyncConfig {
  installmentNo: number;
  feeInstallmentId: string;
  amount: number;
  dueDate: Date;
}

export async function syncStudentFeeInstallmentsForUpdatedFeeTemplate(
  tx: Prisma.TransactionClient,
  feeId: string,
  totalAmount: number,
  templateInstallments: FeeInstallmentSyncConfig[]
): Promise<void> {
  if (!templateInstallments.length) {
    return;
  }

  // Sync untouched base installments to the updated template values.
  // Exclude students with any split-derived installments (isBase: false).
  await Promise.all(
    templateInstallments.map((template) =>
      tx.studentFeeInstallment.updateMany({
        where: {
          feeInstallmentId: template.feeInstallmentId,
          isBase: true,
          status: "UNPAID",
          studentSemesterFee: {
            installments: { none: { isBase: false } },
          },
        },
        data: {
          amount: template.amount,
          dueDate: template.dueDate,
        },
      })
    )
  );

  // If a student already paid one base installment, preserve the paid amount
  // and adjust their remaining unpaid base installment so the student still
  // reflects the updated total amount.
  // Only consider students with no split-derived installments (none: { isBase: false }).
  const studentsWithBaseInstallments = await tx.studentSemesterFee.findMany({
    where: {
      semesterFeeId: feeId,
      installments: { none: { isBase: false } },
    },
    select: {
      id: true,
      installments: {
        where: { isBase: true },
        select: {
          id: true,
          orderNo: true,
          amount: true,
          status: true,
        },
      },
    },
  });

  const templateByOrder = new Map(
    templateInstallments.map((template) => [template.installmentNo, template])
  );

  await Promise.all(
    studentsWithBaseInstallments.map(async (record) => {
      const paidInstallments = record.installments.filter(
        (inst) => inst.status === "PAID"
      );
      const unpaidInstallments = record.installments.filter(
        (inst) => inst.status === "UNPAID"
      );

      // Only handle case: exactly 1 paid and exactly 1 unpaid base installment
      if (paidInstallments.length !== 1 || unpaidInstallments.length !== 1) {
        return;
      }

      const paidAmount = Number(paidInstallments[0].amount);
      const remainder = Number(totalAmount) - paidAmount;
      if (remainder <= 0) {
        return;
      }

      const unpaidInstallment = unpaidInstallments[0];
      const template = templateByOrder.get(unpaidInstallment.orderNo);
      if (!template) {
        return;
      }

      await tx.studentFeeInstallment.update({
        where: { id: unpaidInstallment.id },
        data: {
          amount: remainder,
          dueDate: template.dueDate,
        },
      });
    })
  );

  await tx.studentSemesterFee.updateMany({
    where: {
      semesterFeeId: feeId,
      installments: {
        none: {
          isBase: false,
        },
      },
    },
    data: {
      totalDue: totalAmount,
    },
  });
}
