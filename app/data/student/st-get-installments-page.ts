import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import { requireSession } from "../session/require-session";
import { FinePolicyType } from "@/lib/utils/fine-calculation";
import type { InstallmentStatus } from "@/components/fee/installment-status-config";
import type {
  SplitRequestStatus,
  StudentFeeInstallmentStatus,
} from "@/lib/generated/prisma/enums";

export interface StudentInstallmentSplitRequestForPage {
  id: string;
  studentFeeInstallmentId: string;
  status: SplitRequestStatus;
  requestedAmount: number;
  preferredDueDate: Date;
  createdAt: Date;
}

export interface StudentInstallmentForPage {
  id: string;
  installmentNo: number;
  amount: number;
  dueDate: Date;
  updatedAt: Date;
  status: StudentFeeInstallmentStatus;
  paidAt: Date | null;
  statusType: InstallmentStatus;
  fineType: FinePolicyType | null;
  fineAmount: number | null;
  fineMaxDays: number | null;
  fineCapAmount: number | null;
  installmentSplitRequests: StudentInstallmentSplitRequestForPage[];
}

export interface FeeInstallmentForPage {
  id: string;
  installmentNo: number;
  amount: number;
  dueDate: Date;
  description: string | null;
  fineType: FinePolicyType | null;
  fineAmount: number | null;
  fineMaxDays: number | null;
  fineCapAmount: number | null;
  status: StudentFeeInstallmentStatus;
  statusType: InstallmentStatus;
}

export interface StudentFeeInstallmentsPageData {
  id: string;
  student: {
    name: string;
    image: string | null;
    registrationNo: string;
  };
  feeInstallments: FeeInstallmentForPage[];
  displayedInstallments: StudentInstallmentForPage[];
  installmentSplitRequests: StudentInstallmentSplitRequestForPage[];
  hasStudentInstallments: boolean;
}

export async function studentGetInstallmentsPageData(): Promise<StudentFeeInstallmentsPageData | null> {
  const can = await requirePermission({
    installments: ["view"],
  });

  if (!can) {
    redirect("/unauthorized");
  }

  const session = await requireSession();

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      registrationNo: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  const record = await prisma.studentSemesterFee.findFirst({
    where: {
      studentId: student.id,
    },
    select: {
      id: true,
      semesterFee: {
        select: {
          feeInstallments: {
            orderBy: { installmentNo: "asc" },
            select: {
              id: true,
              installmentNo: true,
              amount: true,
              dueDate: true,
              description: true,
              fineType: true,
              fineAmount: true,
              fineMaxDays: true,
              fineCapAmount: true,
            },
          },
        },
      },
      installments: {
        orderBy: { orderNo: "asc" },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          orderNo: true,
          paidAt: true,
          updatedAt: true,
          status: true,
          feeInstallment: {
            select: {
              id: true,
              installmentNo: true,
              amount: true,
              dueDate: true,
              description: true,
              fineType: true,
              fineAmount: true,
              fineMaxDays: true,
              fineCapAmount: true,
            },
          },
          installmentSplitRequests: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              requestedAmount: true,
              preferredDueDate: true,
              createdAt: true,
            },
          },
        },
      },
      splitRequests: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          requestedAmount: true,
          preferredDueDate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!record) {
    return null;
  }

  const baseInstallments = record.semesterFee.feeInstallments;

  const feeInstallments: FeeInstallmentForPage[] = baseInstallments.map(
    (inst) => ({
      id: inst.id,
      installmentNo: inst.installmentNo,
      amount: Number(inst.amount),
      dueDate: inst.dueDate,
      description: inst.description,
      fineType: inst.fineType as FinePolicyType | null,
      fineAmount: inst.fineAmount ? Number(inst.fineAmount) : null,
      fineMaxDays: inst.fineMaxDays,
      fineCapAmount: inst.fineCapAmount ? Number(inst.fineCapAmount) : null,
      status: "UNPAID",
      statusType: "upcoming",
    })
  );

  const displayedInstallments: StudentInstallmentForPage[] =
    record.installments.map((inst) => {
      const source =
        inst.feeInstallment ??
        baseInstallments.find((base) => base.installmentNo === inst.orderNo) ??
        null;

      return {
        id: inst.id,
        installmentNo: inst.orderNo,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
        updatedAt: inst.updatedAt,
        status: inst.status as StudentFeeInstallmentStatus,
        paidAt: inst.paidAt,
        statusType: "upcoming",
        fineType: (source?.fineType as FinePolicyType | null) ?? null,
        fineAmount: source?.fineAmount ? Number(source.fineAmount) : null,
        fineMaxDays: source?.fineMaxDays ?? null,
        fineCapAmount: source?.fineCapAmount
          ? Number(source.fineCapAmount)
          : null,
        installmentSplitRequests: inst.installmentSplitRequests.map(
          (request) => ({
            id: request.id,
            studentFeeInstallmentId: inst.id,
            status: request.status as SplitRequestStatus,
            requestedAmount: Number(request.requestedAmount),
            preferredDueDate: request.preferredDueDate,
            createdAt: request.createdAt,
          })
        ),
      };
    });

  const installmentSplitRequests = record.installments.flatMap((inst) =>
    inst.installmentSplitRequests.map((request) => ({
      id: request.id,
      studentFeeInstallmentId: inst.id,
      status: request.status,
      requestedAmount: Number(request.requestedAmount),
      preferredDueDate: request.preferredDueDate,
      createdAt: request.createdAt,
    }))
  );

  return {
    id: record.id,
    student: {
      name: student.user.name,
      image: student.user.image,
      registrationNo: student.registrationNo,
    },
    feeInstallments,
    displayedInstallments,
    installmentSplitRequests,
    hasStudentInstallments: displayedInstallments.length > 0,
  };
}

export type StudentGetInstallmentsPageDataType = Awaited<
  ReturnType<typeof studentGetInstallmentsPageData>
>;
