"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { SplitRequestStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import {
  calculateFine,
  type FinePolicyType,
} from "@/lib/utils/fine-calculation";
import type { ApiResponseType } from "@/lib/types";
import {
  hodReviewSplitRequestSchema,
  type HodReviewSplitRequestSchemaType,
} from "./review/schema";
import { Decimal } from "@/lib/generated/prisma/internal/prismaNamespace";

const HOD_ALLOWED_TARGET_STATUSES: SplitRequestStatus[] = [
  "HOD_APPROVED",
  "HOD_REJECTED",
  "HOD_REVIEW_REQUESTED",
];

const statusToAction = {
  HOD_APPROVED: "HOD_APPROVED",
  HOD_REJECTED: "HOD_REJECTED",
  HOD_REVIEW_REQUESTED: "HOD_REVIEW_REQUESTED",
} as const;

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

    // ===== FETCH SPLIT REQUEST WITH ALL REQUIRED DATA =====
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
        studentSemesterFeeId: true,
        studentId: true,
        studentFeeInstallment: {
          select: {
            id: true,
            orderNo: true,
            amount: true,
            dueDate: true,
            studentSemesterFeeId: true,
            studentId: true,
            feeInstallmentId: true,
            feeInstallment: {
              select: {
                fineType: true,
                fineAmount: true,
                fineMaxDays: true,
                fineCapAmount: true,
              },
            },
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

    // ===== VALIDATE BASE INSTALLMENT EXISTS =====
    if (!splitRequest.studentFeeInstallment) {
      return {
        status: "error",
        message: "Base installment not found for this split request.",
      };
    }

    const baseInstallment = splitRequest.studentFeeInstallment;
    const sourceOrderNo = baseInstallment.orderNo ?? 1;

    const existingInstallments = await prisma.studentFeeInstallment.count({
      where: {
        studentId: splitRequest.studentId!,
        studentSemesterFeeId: splitRequest.studentSemesterFeeId,
      },
    });

    console.log("Existing installments:", existingInstallments);

    if (!splitRequest.studentId) {
      return {
        status: "error",
        message: "Student ID not found for split request.",
      };
    }

    const studentSemesterFeeId =
      splitRequest.studentSemesterFeeId || baseInstallment.studentSemesterFeeId;

    if (!studentSemesterFeeId) {
      return {
        status: "error",
        message: "Student semester fee not found.",
      };
    }

    // Pre-calculate amounts and fines outside
    const sourceAmount = Number(baseInstallment.amount);
    const remainingAmount = sourceAmount - requestedAmount;
    let accruedFine = 0;

    if (validated.data.status === "HOD_APPROVED") {
      if (remainingAmount <= 0) {
        return {
          status: "error",
          message: "Requested amount cannot exceed installment amount.",
        };
      }

      // Calculate accrued fine (if any) using the student's installment due date
      if (baseInstallment.feeInstallment) {
        const fineResult = calculateFine(baseInstallment.dueDate, new Date(), {
          fineType: baseInstallment.feeInstallment
            .fineType as FinePolicyType | null,
          fineAmount: baseInstallment.feeInstallment.fineAmount
            ? Number(baseInstallment.feeInstallment.fineAmount)
            : null,
          fineMaxDays: baseInstallment.feeInstallment.fineMaxDays,
          fineCapAmount: baseInstallment.feeInstallment.fineCapAmount
            ? Number(baseInstallment.feeInstallment.fineCapAmount)
            : null,
        });

        accruedFine = fineResult.fineAmount;
        console.log("Fine calculated for overdue installment:", accruedFine);
      }
    }

    // ===== EXECUTE TRANSACTION =====
    await prisma.$transaction(async (tx) => {
      const sourceStudentInstallmentId = baseInstallment.id;

      if (validated.data.status === "HOD_APPROVED") {
        if (sourceOrderNo === 1) {
          // Splitting installment 1 — merge remainder+fine into existing 2nd

          // Update source installment 1 with just requestedAmount
          await tx.studentFeeInstallment.update({
            where: { id: baseInstallment.id },
            data: {
              amount: new Decimal(requestedAmount),
              dueDate: splitRequest.preferredDueDate,
              isBase: false,
            },
          });

          // Fetch existing 2nd installment and absorb remainder + fine into it
          const secondInstallment = await tx.studentFeeInstallment.findFirst({
            where: { studentSemesterFeeId, orderNo: 2 },
          });

          if (!secondInstallment) {
            throw new Error("Second installment not found.");
          }

          await tx.studentFeeInstallment.update({
            where: { id: secondInstallment.id },
            data: {
              amount: new Decimal(
                remainingAmount + accruedFine + Number(secondInstallment.amount)
              ),
            },
          });

          console.log(
            `Split inst 1: merged remainder=${remainingAmount} + fine=${accruedFine} into inst 2`
          );
        } else if (sourceOrderNo === 2) {
          // Splitting installment 2 — create new 3rd with remainder+fine

          // Block if already at 3 installments
          if (existingInstallments >= 3) {
            throw new Error("Maximum of 3 installments already exist.");
          }

          // Update source installment 2 with just requestedAmount
          await tx.studentFeeInstallment.update({
            where: { id: baseInstallment.id },
            data: {
              amount: new Decimal(requestedAmount),
              dueDate: splitRequest.preferredDueDate,
              isBase: false,
            },
          });

          // Create installment 3 with remainder + fine
          const remainingDueDate = new Date(splitRequest.preferredDueDate);
          remainingDueDate.setDate(remainingDueDate.getDate() + 30);

          await tx.studentFeeInstallment.create({
            data: {
              studentId: splitRequest.studentId!,
              studentSemesterFeeId,
              feeInstallmentId: baseInstallment.feeInstallmentId ?? undefined,
              amount: new Decimal(remainingAmount + accruedFine),
              dueDate: remainingDueDate,
              orderNo: 3,
              isBase: false,
              status: "UNPAID",
            },
          });

          console.log(
            `Split inst 2: created inst 3 with remainder=${remainingAmount} + fine=${accruedFine}`
          );
        } else {
          throw new Error("Cannot split installment beyond the second.");
        }
      }

      // ===== UPDATE SPLIT REQUEST STATUS =====
      await tx.installmentSplitRequest.update({
        where: {
          id: splitRequest.id,
        },
        data: {
          status: validated.data.status,
          ...(validated.data.status === "HOD_APPROVED"
            ? { studentFeeInstallmentId: sourceStudentInstallmentId }
            : {}),
        },
      });

      // ===== CREATE REVIEW RECORD =====
      await tx.installmentSplitRequestReview.create({
        data: {
          splitRequestId: splitRequest.id,
          actorRole: "HOD",
          actorId: session.user.id,
          action: statusToAction[validated.data.status],
          remarks: validated.data.remarks.trim() || null,
          fromStatus: splitRequest.status,
          toStatus: validated.data.status,
        },
      });

      console.log(
        `Split request ${splitRequest.id} reviewed by HOD: ${validated.data.status}`
      );
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
