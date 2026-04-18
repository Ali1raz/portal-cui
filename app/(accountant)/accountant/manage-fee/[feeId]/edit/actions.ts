"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";
import {
  accountantEditInstallmentsSchema,
  type AccountantEditInstallmentsSchemaType,
} from "./schema";

export async function accountantUpsertFeeInstallments(
  feeId: string,
  values: AccountantEditInstallmentsSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      fee: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update fee installments.",
      };
    }

    const validated = accountantEditInstallmentsSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
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
      return {
        status: "error",
        message: "Accountant profile not found.",
      };
    }

    const fee = await prisma.semesterFee.findFirst({
      where: {
        id: feeId,
        accountantId: accountant.id,
      },
      select: {
        id: true,
        totalAmount: true,
      },
    });

    if (!fee) {
      return {
        status: "error",
        message: "Semester fee not found.",
      };
    }

    const {
      firstInstallmentAmount,
      firstInstallmentDueDate,
      firstInstallmentDescription,
      secondInstallmentDescription,
    } = validated.data.installments;

    const secondInstallmentAmount =
      validated.data.totalAmount - firstInstallmentAmount;

    const secondInstallmentDueDate = new Date(firstInstallmentDueDate);
    secondInstallmentDueDate.setDate(secondInstallmentDueDate.getDate() + 30);

    await prisma.$transaction(async (tx) => {
      await tx.semesterFee.update({
        where: {
          id: fee.id,
        },
        data: {
          totalAmount: validated.data.totalAmount,
        },
      });

      await tx.feeInstallment.upsert({
        where: {
          semesterFeeId_installmentNo: {
            semesterFeeId: fee.id,
            installmentNo: 1,
          },
        },
        create: {
          semesterFeeId: fee.id,
          installmentNo: 1,
          amount: firstInstallmentAmount,
          dueDate: firstInstallmentDueDate,
          description: firstInstallmentDescription,
        },
        update: {
          amount: firstInstallmentAmount,
          dueDate: firstInstallmentDueDate,
          description: firstInstallmentDescription,
        },
      });

      await tx.feeInstallment.upsert({
        where: {
          semesterFeeId_installmentNo: {
            semesterFeeId: fee.id,
            installmentNo: 2,
          },
        },
        create: {
          semesterFeeId: fee.id,
          installmentNo: 2,
          amount: secondInstallmentAmount,
          dueDate: secondInstallmentDueDate,
          description: secondInstallmentDescription,
        },
        update: {
          amount: secondInstallmentAmount,
          dueDate: secondInstallmentDueDate,
          description: secondInstallmentDescription,
        },
      });
    });

    return {
      status: "success",
      message: "Installments updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
