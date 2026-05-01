import prisma from "@/lib/prisma";
import "server-only";
import { requireSession } from "../session/require-session";

export async function studentGetAllInstallments() {
  const session = await requireSession();
  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    return [];
  }

  const data = await prisma.installmentSplitRequest.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      preferredDueDate: true,
      requestedAmount: true,
      status: true,
      feeInstallment: {
        select: {
          installmentNo: true,
          amount: true,
          dueDate: true,
          semesterFeeId: true,
        },
      },
      studentFeeInstallment: {
        select: {
          id: true,
          orderNo: true,
          amount: true,
          dueDate: true,
          semesterFeeId: true,
          status: true,
        },
      },
    },
  });

  const semesterFeeIds = Array.from(
    new Set(
      data
        .map(
          (request) =>
            request.studentFeeInstallment?.semesterFeeId ??
            request.feeInstallment?.semesterFeeId
        )
        .filter((value): value is string => Boolean(value))
    )
  );

  const remainingSecondInstallments = semesterFeeIds.length
    ? await prisma.studentFeeInstallment.findMany({
        where: {
          studentId: student.id,
          semesterFeeId: {
            in: semesterFeeIds,
          },
          orderNo: 2,
        },
        select: {
          id: true,
          semesterFeeId: true,
          orderNo: true,
          amount: true,
          dueDate: true,
          status: true,
        },
      })
    : [];

  const remainingBySemesterFeeId = new Map(
    remainingSecondInstallments.map((installment) => [
      installment.semesterFeeId,
      installment,
    ])
  );

  return data.map((request) => {
    const semesterFeeIdForRequest =
      request.studentFeeInstallment?.semesterFeeId ??
      request.feeInstallment?.semesterFeeId;

    const sourceInstallment =
      request.studentFeeInstallment ?? request.feeInstallment;
    const sourceInstallmentNo = request.studentFeeInstallment
      ? request.studentFeeInstallment.orderNo
      : request.feeInstallment
        ? request.feeInstallment.installmentNo
        : "-";

    const remainingInstallmentData = semesterFeeIdForRequest
      ? remainingBySemesterFeeId.get(semesterFeeIdForRequest)
      : null;

    const isApproved =
      request.status === "HOD_APPROVED" || request.status === "APPROVED";
    const canDelete = !isApproved;

    const sourceInstallmentIsPaid =
      request.studentFeeInstallment?.status === "PAID";
    const remainingInstallmentIsPaid =
      remainingInstallmentData?.status === "PAID";
    const canMarkPaid =
      isApproved &&
      Boolean(request.studentFeeInstallment || remainingInstallmentData) &&
      (!sourceInstallmentIsPaid || !remainingInstallmentIsPaid);

    return {
      ...request,
      requestedAmount: Number(request.requestedAmount),
      feeInstallment: request.feeInstallment
        ? {
            ...request.feeInstallment,
            amount: Number(request.feeInstallment.amount),
          }
        : null,
      studentFeeInstallment: request.studentFeeInstallment
        ? {
            ...request.studentFeeInstallment,
            amount: Number(request.studentFeeInstallment.amount),
          }
        : null,
      remainingInstallment: remainingInstallmentData
        ? {
            ...remainingInstallmentData,
            amount: Number(remainingInstallmentData.amount),
          }
        : null,

      sourceInstallmentNo,
      sourceAmount: sourceInstallment ? Number(sourceInstallment.amount) : 0,
      isApproved,
      canDelete,
      canMarkPaid,
    };
  });
}

export type StudentGetAllInstallmentsType = Awaited<
  ReturnType<typeof studentGetAllInstallments>
>;
