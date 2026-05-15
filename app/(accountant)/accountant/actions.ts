"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import type { ApiResponseType } from "@/lib/types";
import {
  accountantCreateFeeSchema,
  AccountantCreateFeeSchemaType,
} from "./create-fee/schema";
import { protect } from "@/lib/arcjet-protect";

export async function accountantUpdateFeeStatus(
  feeId: string,
  status: SemesterFeeStatus
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const [deniedMessage, can] = await Promise.all([
      protect(session.user.id),
      requirePermission({
        fee: ["update"],
      }),
    ]);

    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update fee status.",
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

    const existingFee = await prisma.semesterFee.findFirst({
      where: {
        id: feeId,
        accountantId: accountant.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingFee) {
      return {
        status: "error",
        message: "Semester fee not found.",
      };
    }

    if (existingFee.status === status) {
      return {
        status: "success",
        message: "Fee status is already up to date.",
      };
    }

    await prisma.semesterFee.update({
      where: {
        id: existingFee.id,
      },
      data: {
        status,
      },
    });

    return {
      status: "success",
      message: "Fee status updated successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error, "Could not update fee status"),
    };
  }
}

export async function accountantCreateSemesterFee(
  values: AccountantCreateFeeSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const validated = accountantCreateFeeSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data!" };
    }

    const deniedMessage = await protect(session.user.id);
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
            fineType: validated.data.installments.fineType ?? null,
            fineAmount: validated.data.installments.fineAmount ?? null,
            fineMaxDays: validated.data.installments.fineMaxDays ?? null,
            fineCapAmount: validated.data.installments.fineCapAmount ?? null,
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
            fineType: validated.data.installments.fineType ?? null,
            fineAmount: validated.data.installments.fineAmount ?? null,
            fineMaxDays: validated.data.installments.fineMaxDays ?? null,
            fineCapAmount: validated.data.installments.fineCapAmount ?? null,
          },
        });
      }
      // Send Inngest event to fan-out student semester fee creation (non-blocking)
      try {
        await inngest.send({
          id: `semester-fee-created-${createdFee.id}`,
          name: "fee/semester.published",
          data: {
            semesterFeeId: createdFee.id,
            semesterId: validated.data.semesterId,
          },
        });
      } catch (error) {
        console.error(
          `Failed to send semester fee created event: ${error instanceof Error ? error.message : String(error)}`
        );
        // Don't fail the action if event emission fails; log and continue
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
