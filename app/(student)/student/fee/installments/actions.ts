"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { protect } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import type { ApiResponseType } from "@/lib/types";
import { VoucherData } from "../_components/fee-voucher";

export async function markStudentInstallmentAsPaid(
  installmentId: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id);
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

    const deniedMessage = await protect(session.user.id);
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

    const deniedMessage = await protect(session.user.id);
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

export async function generateVoucher(
  installmentId: string
): Promise<ApiResponseType | (ApiResponseType & { voucher: VoucherData })> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return { status: "error", message: deniedMessage };
    }

    // load student from session — student.id used server-side only
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return { status: "error", message: "Student profile not found." };
    }

    // load installment and verify ownership
    const installment = await prisma.studentFeeInstallment.findFirst({
      where: { id: installmentId, studentId: student.id },
      select: {
        id: true,
        status: true,
        amount: true,
        dueDate: true,
        orderNo: true,
      },
    });

    if (!installment) {
      return { status: "error", message: "Installment not found." };
    }

    // Block if already paid
    if (installment.status === "PAID") {
      return {
        status: "error",
        message: "Installment already paid. Voucher cannot be issued.",
      };
    }

    // Compute PKT (Asia/Karachi, UTC+5) startOfToday in UTC and endOfToday in UTC
    const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // +5 hours
    const now = new Date();
    const pktNow = new Date(now.getTime() + PKT_OFFSET_MS);
    const localYear = pktNow.getUTCFullYear();

    const pktYear = pktNow.getUTCFullYear();
    const pktMonth = pktNow.getUTCMonth();
    const pktDate = pktNow.getUTCDate();

    const startOfTodayUtc = new Date(
      Date.UTC(pktYear, pktMonth, pktDate, 0, 0, 0, 0) - PKT_OFFSET_MS
    );
    const endOfTodayUtc = new Date(
      Date.UTC(pktYear, pktMonth, pktDate, 23, 59, 59, 999) - PKT_OFFSET_MS
    );

    const all = await prisma.feeVoucher.findMany({
      where: {
        studentFeeInstallmentId: installment.id,
      },
    });

    console.log("Existing vouchers for installment:", all.length);

    // Idempotency check — if ACTIVE voucher exists for today, return it
    const existing = await prisma.feeVoucher.findFirst({
      where: {
        studentFeeInstallmentId: installment.id,
        status: "ACTIVE",
        expiryDate: { gte: startOfTodayUtc },
      },
      include: {
        studentFeeInstallment: {
          select: {
            orderNo: true,
            student: {
              select: {
                registrationNo: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (
      existing &&
      Number(existing.amount) === Number(installment.amount) &&
      existing.dueDate.getTime() === installment.dueDate.getTime()
    ) {
      const mapped: VoucherData = {
        voucherId: existing.voucherNo,
        installmentNo: existing.studentFeeInstallment.orderNo,
        amount: Number(existing.amount),
        dueDate: existing.dueDate.toISOString(),
        expiryDate: existing.expiryDate?.toISOString(),
        printedAt: new Date().toISOString(),
        institutionName: undefined,
        student: {
          registrationNo: existing.studentFeeInstallment.student.registrationNo,
          name: existing.studentFeeInstallment.student.user.name,
        },
      };

      console.log(
        `Existing active voucher found for installment ${existing.voucherNo} - ${existing.expiryDate}.`
      );

      return {
        status: "success",
        voucher: mapped,
        message: "Existing voucher returned.",
      };
    }

    if (existing) {
      console.log(
        `Found stale active voucher ${existing.voucherNo} for installment ${installment.id}. Regenerating with updated amount/due date.`
      );
    }

    // Create voucher inside transaction: expire old ACTIVE ones, bump counter, create new voucher
    const result = await prisma.$transaction(async (tx) => {
      console.log("No active voucher found. Generating new voucher...");
      // expire any lingering active vouchers for this installment
      await tx.feeVoucher.updateMany({
        where: {
          studentFeeInstallmentId: installment.id,
          status: "ACTIVE",
        },
        data: {
          status: "EXPIRED",
          expiredAt: new Date(),
        },
      });

      // bump or create counter row safely
      const counter = await tx.feeVoucherCounter.upsert({
        where: { id: 1 },
        update: { seq: { increment: 1 } },
        create: { id: 1, seq: 1 },
      });

      console.log("Counter after increment:", counter.seq);

      const seq = String(counter.seq);
      const voucherNo = `${localYear}${seq.padStart(6, "0")}`;
      console.log("Generated voucher number:", voucherNo);

      const voucher = await tx.feeVoucher.create({
        data: {
          voucherNo,
          studentFeeInstallmentId: installment.id,
          studentId: student.id,
          amount: installment.amount,
          dueDate: installment.dueDate,
          expiryDate: endOfTodayUtc,
          status: "ACTIVE",
        },
        include: {
          studentFeeInstallment: {
            select: {
              orderNo: true,
              student: {
                select: {
                  registrationNo: true,
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const mapped: VoucherData = {
        voucherId: voucher.voucherNo,
        installmentNo: voucher.studentFeeInstallment.orderNo,
        amount: Number(voucher.amount),
        dueDate: voucher.dueDate.toISOString(),
        expiryDate: voucher.expiryDate?.toISOString(),
        printedAt: new Date().toISOString(),
        institutionName: undefined,
        student: {
          registrationNo: voucher.studentFeeInstallment.student.registrationNo,
          name: voucher.studentFeeInstallment.student.user.name,
        },
      };

      return mapped;
    });

    return {
      status: "success",
      voucher: result,
      message: "Voucher generated.",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message: errorMessage(error, "Failed to generate voucher."),
    };
  }
}
