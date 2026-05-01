import "server-only";

import { notFound, redirect } from "next/navigation";

import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import prisma from "@/lib/prisma";
import { getStudentFeeSplitContextByStudentId } from "./st-get-installment-split-options";
import { studentCanEditSplitRequest } from "@/app/(student)/student/fee/installments/installment-split-request-constants";

export async function studentGetInstallmentSplitRequestForEdit(
  requestId: string
) {
  const can = await requirePermission({
    fee: ["view"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

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
    return redirect("/unauthorized");
  }

  const request = await prisma.installmentSplitRequest.findFirst({
    where: {
      id: requestId,
      studentId: student.id,
    },
    select: {
      id: true,
      status: true,
      requestedAmount: true,
      preferredDueDate: true,
      reason: true,
      createdAt: true,
    },
  });

  if (!request) {
    return notFound();
  }

  const feeContext = await getStudentFeeSplitContextByStudentId(student.id);

  if (!feeContext) {
    return notFound();
  }

  return {
    ...request,
    requestedAmount: Number(request.requestedAmount),
    feeContext,
    canEdit: studentCanEditSplitRequest(request.status),
  };
}

export type StudentInstallmentSplitRequestForEdit = NonNullable<
  Awaited<ReturnType<typeof studentGetInstallmentSplitRequestForEdit>>
>;
