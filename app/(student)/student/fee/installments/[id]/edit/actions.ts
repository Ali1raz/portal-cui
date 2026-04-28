"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { getStudentFeeSplitContextByStudentId } from "@/app/data/student/st-get-installment-split-options";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";
import { studentCanEditSplitRequest } from "../../installment-split-request-constants";
import {
  updateInstallmentSplitRequestSchema,
  type UpdateInstallmentSplitRequestSchemaType,
} from "./schema";

function getNextStatusForResubmission(currentStatus: string) {
  if (
    currentStatus === "HOD_REVIEW_REQUESTED" ||
    currentStatus === "HOD_REJECTED" ||
    currentStatus === "REJECTED"
  ) {
    return "PENDING" as const;
  }

  return currentStatus as "PENDING";
}

export async function updateInstallmentSplitRequest(
  requestId: string,
  values: UpdateInstallmentSplitRequestSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      fee: ["view"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update installment requests.",
      };
    }

    const validated = updateInstallmentSplitRequestSchema.safeParse(values);

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

    const splitRequest = await prisma.installmentSplitRequest.findFirst({
      where: {
        id: requestId,
        studentId: student.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!splitRequest) {
      return {
        status: "error",
        message: "Installment request not found.",
      };
    }

    if (!studentCanEditSplitRequest(splitRequest.status)) {
      return {
        status: "error",
        message: "This installment request cannot be edited.",
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

    const nextStatus = getNextStatusForResubmission(splitRequest.status);

    await prisma.$transaction(async (tx) => {
      await tx.installmentSplitRequest.update({
        where: {
          id: splitRequest.id,
        },
        data: {
          requestedAmount: splitAmount,
          preferredDueDate: validated.data.preferredDueDate,
          reason: validated.data.reason,
          status: nextStatus,
        },
      });

      await tx.installmentSplitRequestReview.create({
        data: {
          splitRequestId: splitRequest.id,
          actorRole: "STUDENT",
          actorId: session.user.id,
          action: "RESUBMITTED",
          remarks: "Request updated by student",
          fromStatus: splitRequest.status,
          toStatus: nextStatus,
        },
      });
    });

    return {
      status: "success",
      message:
        nextStatus === "PENDING"
          ? "Installment request updated and resubmitted successfully."
          : "Installment request updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(
        error,
        "Failed to update installment request. Please try again."
      ),
    };
  }
}
