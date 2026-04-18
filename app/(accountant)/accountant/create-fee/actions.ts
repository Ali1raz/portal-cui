"use server";

import { ApiResponseType } from "@/lib/types";
import {
  accountantCreateFeeSchema,
  AccountantCreateFeeSchemaType,
} from "./schema";
import { requireSession } from "@/app/data/session/require-session";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";

export async function accountantCreateSemesterFee(
  values: AccountantCreateFeeSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const validated = accountantCreateFeeSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data!" };
    }

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      fee: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create semester fee.",
      };
    }

    // Fetch in parallel: accountant, semester, and check for existing fee
    const [acc, sem, existingFee] = await Promise.all([
      prisma.accountant.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      }),
      prisma.semester.findUnique({
        where: {
          id: validated.data.semesterId,
        },
        select: {
          id: true,
        },
      }),
      prisma.semesterFee.findFirst({
        where: {
          semesterId: validated.data.semesterId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!acc) {
      return { status: "error", message: "Accountant not found!" };
    }

    if (!sem) {
      return { status: "error", message: "Semester not found!" };
    }

    if (existingFee) {
      return { status: "error", message: "Semester fee already created!" };
    }

    await prisma.$transaction(async (tx) => {
      const createdFee = await tx.semesterFee.create({
        data: {
          totalAmount: validated.data.totalAmount,
          semesterId: validated.data.semesterId,
          status: validated.data.status,
          description: validated.data.description,
          accountantId: acc.id,
        },
      });

      // Create installments if enabled
      if (validated.data.makeInstallments && validated.data.installments) {
        const {
          firstInstallmentAmount,
          firstInstallmentDueDate,
          firstInstallmentDescription,
          secondInstallmentDescription,
        } = validated.data.installments;

        const secondInstallmentAmount =
          validated.data.totalAmount - firstInstallmentAmount;

        // Calculate second installment due date (30 days after first)
        const secondDueDate = new Date(firstInstallmentDueDate);
        secondDueDate.setDate(secondDueDate.getDate() + 30);

        // Create first installment
        await tx.feeInstallment.create({
          data: {
            semesterFeeId: createdFee.id,
            installmentNo: 1,
            amount: firstInstallmentAmount,
            dueDate: firstInstallmentDueDate,
            description: firstInstallmentDescription,
          },
        });

        // Create second installment
        await tx.feeInstallment.create({
          data: {
            semesterFeeId: createdFee.id,
            installmentNo: 2,
            amount: secondInstallmentAmount,
            dueDate: secondDueDate,
            description: secondInstallmentDescription,
          },
        });
      }
    });

    return {
      status: "success",
      message: "Semester Fee created successfully",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error, "Could not create semester Fee"),
    };
  }
}
