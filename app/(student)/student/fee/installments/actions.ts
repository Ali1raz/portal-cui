"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";

export async function deleteInstallmentSplitRequest(
  requestId: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return { status: "error", message: deniedMessage };
    }

    const can = await requirePermission({ fee: ["view"] });
    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete installment requests.",
      };
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return { status: "error", message: "Student profile not found." };
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
      return { status: "error", message: "Installment request not found." };
    }

    if (
      splitRequest.status === "HOD_APPROVED" ||
      splitRequest.status === "APPROVED"
    ) {
      return {
        status: "error",
        message: "Approved installment requests cannot be canceled.",
      };
    }

    await prisma.installmentSplitRequest.update({
      where: { id: splitRequest.id },
      data: {
        status: "CANCELLED",
      },
    });

    await prisma.installmentSplitRequestReview.create({
      data: {
        splitRequestId: splitRequest.id,
        action: "CANCELLED",
        actorRole: "STUDENT",
        actorId: session.user.id,
        fromStatus: splitRequest.status,
        toStatus: "CANCELLED",
      },
    });

    return {
      status: "success",
      message: "Installment request cancelled successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error, "Failed to delete installment request."),
    };
  }
}
