"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";
import {
  createInstallmentSplitRequestSchema,
  type CreateInstallmentSplitRequestSchemaType,
} from "./schema";

export async function createInstallmentSplitRequest(
  values: CreateInstallmentSplitRequestSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      fee: ["view"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to request installment split.",
      };
    }

    const validated = createInstallmentSplitRequestSchema.safeParse(values);

    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
    }

    const student = await prisma.student.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        status: "error",
        message: "Student profile not found.",
      };
    }

    const feeInstallment = await prisma.feeInstallment.findFirst({
      where: {
        id: validated.data.feeInstallmentId,
        semesterFee: {
          status: "PUBLISHED",
          semester: {
            registrations: {
              some: {
                studentId: student.id,
              },
            },
          },
        },
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        installmentNo: true,
        semesterFeeId: true,
        semesterFee: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    if (!feeInstallment) {
      return {
        status: "error",
        message: "Selected fee installment was not found.",
      };
    }

    const firstInstallmentAmount = validated.data.firstInstallmentAmount;
    const totalAmount = Number(feeInstallment.semesterFee.totalAmount);

    if (firstInstallmentAmount >= totalAmount) {
      return {
        status: "error",
        message:
          "First installment amount must be less than total semester fee.",
      };
    }

    const secondInstallmentAmount = totalAmount - firstInstallmentAmount;

    if (secondInstallmentAmount <= 0) {
      return {
        status: "error",
        message:
          "Remaining amount for second installment must be greater than 0.",
      };
    }

    const existingPendingRequest =
      await prisma.installmentSplitRequest.findFirst({
        where: {
          feeInstallmentId: feeInstallment.id,
          studentId: student.id,

          status: {
            in: ["PENDING", "HOD_REVIEW_REQUESTED", "HOD_APPROVED"],
          },
        },
        select: {
          id: true,
        },
      });

    if (existingPendingRequest) {
      return {
        status: "error",
        message:
          "A split request already exists for this installment and is under review.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const splitRequest = await tx.installmentSplitRequest.create({
        data: {
          feeInstallmentId: feeInstallment.id,
          studentId: student.id,
          requestedAmount: firstInstallmentAmount,
          preferredDueDate: validated.data.preferredDueDate,
          reason: validated.data.reason,
        },
        select: {
          id: true,
        },
      });

      await tx.installmentSplitRequestReview.create({
        data: {
          splitRequestId: splitRequest.id,
          actorRole: "STUDENT",
          actorId: session.user.id,
          action: "SUBMITTED",
          fromStatus: "PENDING",
          toStatus: "PENDING",
        },
      });
    });

    return {
      status: "success",
      message: `Split request submitted. Second installment will be PKR ${secondInstallmentAmount.toLocaleString("en-US")}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(
        error,
        "Failed to submit split request. Please try again."
      ),
    };
  }
}
