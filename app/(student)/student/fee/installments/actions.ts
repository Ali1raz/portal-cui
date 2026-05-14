"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";

export async function markStudentInstallmentAsPaid(
  installmentId: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return { status: "error", message: deniedMessage };
    }

    const can = await requirePermission({ installments: ["mark:paid"] });
    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update installment status.",
      };
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return { status: "error", message: "Student profile not found." };
    }

    const installment = await prisma.studentFeeInstallment.findFirst({
      where: {
        id: installmentId,
        studentId: student.id,
      },
      select: {
        id: true,
        status: true,
        studentSemesterFeeId: true,
      },
    });

    if (!installment) {
      return { status: "error", message: "Installment not found." };
    }

    if (installment.status === "PAID") {
      return {
        status: "error",
        message: "Installment is already marked as paid.",
      };
    }

    if (!installment.studentSemesterFeeId) {
      return {
        status: "error",
        message: "Missing semester fee details for this installment.",
      };
    }

    const studentSemesterFeeId = installment.studentSemesterFeeId;

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.studentFeeInstallment.update({
        where: { id: installment.id },
        data: {
          status: "PAID",
          paidAt: now,
        },
      });

      const unpaidInstallments = await tx.studentFeeInstallment.aggregate({
        where: {
          studentSemesterFeeId,
          status: "UNPAID",
        },
        _sum: {
          amount: true,
        },
      });

      const unpaidTotal = Number(unpaidInstallments._sum.amount ?? 0);

      await tx.studentSemesterFee.update({
        where: { id: studentSemesterFeeId },
        data: {
          totalDue: unpaidTotal,
          status: unpaidTotal > 0 ? "PENDING" : "PAID",
        },
      });
    });

    return {
      status: "success",
      message: "Installment marked as paid.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error, "Failed to update installment status."),
    };
  }
}

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

export async function markInstallmentRequestAsPaid(
  requestId: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return { status: "error", message: deniedMessage };
    }

    const can = await requirePermission({ installments: ["mark:paid"] });
    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update installment status.",
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
        studentSemesterFeeId: true,
        studentFeeInstallment: {
          select: {
            id: true,
            studentSemesterFeeId: true,
            status: true,
          },
        },
      },
    });

    if (!splitRequest) {
      return { status: "error", message: "Installment request not found." };
    }

    if (
      splitRequest.status !== "HOD_APPROVED" &&
      splitRequest.status !== "APPROVED"
    ) {
      return {
        status: "error",
        message: "Only approved requests can be marked as paid.",
      };
    }

    const semesterFeeIdResolved =
      splitRequest.studentSemesterFeeId ??
      splitRequest.studentFeeInstallment?.studentSemesterFeeId;

    if (!semesterFeeIdResolved) {
      return {
        status: "error",
        message: "Missing semester fee details for this request.",
      };
    }

    const now = new Date();

    const updateResults = await prisma.$transaction(async (tx) => {
      let updatedCount = 0;

      if (
        splitRequest.studentFeeInstallment?.id &&
        splitRequest.studentFeeInstallment.status !== "PAID"
      ) {
        await tx.studentFeeInstallment.update({
          where: { id: splitRequest.studentFeeInstallment.id },
          data: {
            status: "PAID",
            paidAt: now,
          },
        });
        updatedCount += 1;
      }

      return { updatedCount };
    });

    if (updateResults.updatedCount === 0) {
      return {
        status: "error",
        message: "Installments are already marked as paid.",
      };
    }

    return {
      status: "success",
      message: "Installment status updated to paid.",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message: errorMessage(error, "Failed to update installment status."),
    };
  }
}
