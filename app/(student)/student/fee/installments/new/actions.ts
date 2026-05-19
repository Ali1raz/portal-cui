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
      installments: ["request"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to request installment split.",
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

    const validated = createInstallmentSplitRequestSchema(
      feeSplitContext.remainingAmount
    ).safeParse(values);

    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
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

    const secondInstallmentAmount = remainingAmount - splitAmount;

    // Check total installments limit
    const totalInstallments = await prisma.studentFeeInstallment.count({
      where: { studentSemesterFeeId: feeSplitContext.studentSemesterFeeId },
    });

    if (totalInstallments >= 3) {
      return {
        status: "error",
        message:
          "Maximum of 3 installments allowed. Cannot request further splits.",
      };
    }

    const [currentStudentInstallment, currentFeeInstallment] =
      await Promise.all([
        prisma.studentFeeInstallment.findFirst({
          where: {
            studentId: student.id,
            status: "UNPAID",
            studentSemesterFee: {
              semesterFeeId: feeSplitContext.semesterFeeId,
            },
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
    console.log("Error in createInstallmentSplitRequest:", error);
    return {
      status: "error",
      message: errorMessage(
        error,
        "Failed to submit split request. Please try again."
      ),
    };
  }
}
