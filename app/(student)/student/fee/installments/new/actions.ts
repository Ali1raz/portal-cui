"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { getStudentFeeSplitContextByStudentId } from "@/app/data/student/st-get-installment-split-options";
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

    const feeSplitContext = await getStudentFeeSplitContextByStudentId(
      student.id
    );

    if (!feeSplitContext) {
      return {
        status: "error",
        message: "Fee details were not found.",
      };
    }

    const splitAmount = validated.data.splitAmount;
    const remainingAmount = feeSplitContext.remainingAmount;

    if (remainingAmount <= 0) {
      return {
        status: "error",
        message: "No remaining fee is available to split.",
      };
    }

    if (splitAmount >= remainingAmount) {
      return {
        status: "error",
        message: "Split amount must be less than the remaining fee.",
      };
    }

    const secondInstallmentAmount = remainingAmount - splitAmount;

    if (secondInstallmentAmount <= 0) {
      return {
        status: "error",
        message:
          "Remaining amount for second installment must be greater than 0.",
      };
    }

    const [currentStudentInstallment, currentFeeInstallment] =
      await Promise.all([
        prisma.studentFeeInstallment.findFirst({
          where: {
            studentId: student.id,
            semesterFeeId: feeSplitContext.semesterFeeId,
            status: "UNPAID",
          },
          orderBy: {
            orderNo: "asc",
          },
          select: {
            id: true,
          },
        }),
        prisma.feeInstallment.findFirst({
          where: {
            semesterFeeId: feeSplitContext.semesterFeeId,
          },
          orderBy: {
            installmentNo: "asc",
          },
          select: {
            id: true,
          },
        }),
      ]);

    const splitRequestLinkData = currentStudentInstallment
      ? {
          studentFeeInstallmentId: currentStudentInstallment.id,
        }
      : currentFeeInstallment
        ? {
            feeInstallmentId: currentFeeInstallment.id,
          }
        : {};

    const existingPendingRequest =
      await prisma.installmentSplitRequest.findFirst({
        where: {
          studentId: student.id,

          status: {
            in: ["PENDING", "HOD_REVIEW_REQUESTED"],
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
          studentId: student.id,
          requestedAmount: splitAmount,
          preferredDueDate: validated.data.preferredDueDate,
          reason: validated.data.reason,
          ...splitRequestLinkData,
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
      message: `Split request submitted. Remaining installment will be PKR ${secondInstallmentAmount.toLocaleString("en-US")}.`,
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
