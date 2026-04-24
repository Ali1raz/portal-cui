"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { SplitRequestStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";
import {
  hodReviewSplitRequestSchema,
  type HodReviewSplitRequestSchemaType,
} from "./review/schema";

const HOD_ALLOWED_TARGET_STATUSES: SplitRequestStatus[] = [
  "HOD_APPROVED",
  "HOD_REJECTED",
  "HOD_REVIEW_REQUESTED",
];

export async function hodReviewSplitRequest(
  requestId: string,
  values: HodReviewSplitRequestSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const [deniedMessage, can] = await Promise.all([
      getArcjetDeniedMessage(session.user.id),
      requirePermission({ fee: ["update"] }),
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
        message: "You are not allowed to review fee split requests.",
      };
    }

    const validated = hodReviewSplitRequestSchema.safeParse(values);

    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
    }

    const hod = await prisma.hod.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        department: true,
      },
    });

    if (!hod) {
      return {
        status: "error",
        message: "HOD profile not found.",
      };
    }

    const splitRequest = await prisma.installmentSplitRequest.findFirst({
      where: {
        id: requestId,
        student: {
          department: hod.department,
        },
      },
      select: {
        id: true,
        status: true,
        requestedAmount: true,
        preferredDueDate: true,
        studentId: true,
        feeInstallmentId: true,
        studentFeeInstallmentId: true,
        feeInstallment: {
          select: {
            semesterFeeId: true,
            amount: true,
            dueDate: true,
          },
        },
        studentFeeInstallment: {
          select: {
            id: true,
            studentId: true,
            semesterFeeId: true,
            installmentId: true,
            amount: true,
            dueDate: true,
            orderNo: true,
          },
        },
      },
    });

    if (!splitRequest) {
      return {
        status: "error",
        message: "Split request not found.",
      };
    }

    if (
      !splitRequest.feeInstallmentId &&
      !splitRequest.studentFeeInstallmentId
    ) {
      return {
        status: "error",
        message: "Request is missing fee source details.",
      };
    }

    if (!HOD_ALLOWED_TARGET_STATUSES.includes(validated.data.status)) {
      return {
        status: "error",
        message: "Invalid status selected.",
      };
    }

    if (splitRequest.status !== "PENDING") {
      return {
        status: "error",
        message: "Only pending requests can be reviewed by HOD.",
      };
    }

    const requestedAmount = Number(splitRequest.requestedAmount);

    if (requestedAmount <= 0) {
      return {
        status: "error",
        message: "Requested amount must be greater than zero.",
      };
    }

    const studentIdForInstallments =
      splitRequest.studentFeeInstallment?.studentId ?? splitRequest.studentId;
    const semesterFeeIdForInstallments =
      splitRequest.studentFeeInstallment?.semesterFeeId ??
      splitRequest.feeInstallment?.semesterFeeId;
    const installmentIdForInstallments =
      splitRequest.feeInstallmentId ??
      splitRequest.studentFeeInstallment?.installmentId ??
      null;

    if (!studentIdForInstallments || !semesterFeeIdForInstallments) {
      return {
        status: "error",
        message: "Request is missing student or semester fee details.",
      };
    }

    const semesterFee = await prisma.semesterFee.findUnique({
      where: {
        id: semesterFeeIdForInstallments,
      },
      select: {
        totalAmount: true,
      },
    });

    if (!semesterFee) {
      return {
        status: "error",
        message: "Could not resolve semester fee for this request.",
      };
    }

    const totalSemesterFeeAmount = Number(semesterFee.totalAmount);

    if (requestedAmount >= totalSemesterFeeAmount) {
      return {
        status: "error",
        message:
          "Requested amount must be less than total semester fee amount.",
      };
    }

    const remainingAmount = totalSemesterFeeAmount - requestedAmount;

    if (remainingAmount <= 0) {
      return {
        status: "error",
        message: "Remaining amount must be greater than zero.",
      };
    }

    await prisma.$transaction(async (tx) => {
      let sourceStudentInstallmentId = splitRequest.studentFeeInstallmentId;

      if (validated.data.status === "HOD_APPROVED") {
        const createdSourceInstallment = await tx.studentFeeInstallment.upsert({
          where: {
            studentId_semesterFeeId_orderNo: {
              studentId: studentIdForInstallments,
              semesterFeeId: semesterFeeIdForInstallments,
              orderNo: 1,
            },
          },
          update: {
            installmentId: installmentIdForInstallments,
            amount: requestedAmount,
            dueDate: splitRequest.preferredDueDate,
            status: "UNPAID",
            isBase: false,
          },
          create: {
            studentId: studentIdForInstallments,
            semesterFeeId: semesterFeeIdForInstallments,
            installmentId: installmentIdForInstallments,
            amount: requestedAmount,
            dueDate: splitRequest.preferredDueDate,
            orderNo: 1,
            status: "UNPAID",
            isBase: false,
          },
          select: {
            id: true,
          },
        });

        sourceStudentInstallmentId = createdSourceInstallment.id;

        // Calculate due date 30 days after order 1
        const order2DueDate = new Date(splitRequest.preferredDueDate);
        order2DueDate.setDate(order2DueDate.getDate() + 30);

        const remainingInstallmentData = {
          studentId: studentIdForInstallments,
          semesterFeeId: semesterFeeIdForInstallments,
          installmentId: installmentIdForInstallments,
          amount: remainingAmount,
          dueDate: order2DueDate,
          orderNo: 2,
          status: "UNPAID" as const,
          isBase: false,
        };

        await tx.studentFeeInstallment.upsert({
          where: {
            studentId_semesterFeeId_orderNo: {
              studentId: studentIdForInstallments,
              semesterFeeId: semesterFeeIdForInstallments,
              orderNo: 2,
            },
          },
          update: {
            installmentId: installmentIdForInstallments,
            amount: remainingAmount,
            dueDate: order2DueDate,
            status: "UNPAID",
            isBase: false,
          },
          create: {
            ...remainingInstallmentData,
            orderNo: 2,
          },
        });
      }

      await tx.installmentSplitRequest.update({
        where: {
          id: splitRequest.id,
        },
        data: {
          status: validated.data.status,
          ...(sourceStudentInstallmentId
            ? { studentFeeInstallmentId: sourceStudentInstallmentId }
            : {}),
        },
      });

      await tx.installmentSplitRequestReview.create({
        data: {
          splitRequestId: splitRequest.id,
          actorRole: "HOD",
          actorId: session.user.id,
          action: validated.data.status,
          remarks: validated.data.remarks.trim() || null,
          fromStatus: splitRequest.status,
          toStatus: validated.data.status,
        },
      });
    });

    if (validated.data.status === "HOD_APPROVED") {
      return {
        status: "success",
        message: "Request approved successfully!",
      };
    }

    if (validated.data.status === "HOD_REVIEW_REQUESTED") {
      return {
        status: "success",
        message: "Update requested from student successfully.",
      };
    }

    return {
      status: "success",
      message: "Request rejected successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(
        error,
        "Could not review the request. Please try again."
      ),
    };
  }
}
