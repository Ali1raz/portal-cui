import "server-only";

import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { FinePolicyType, calculateFine } from "@/lib/utils/fine-calculation";
import { SITE_INFO } from "@/lib/data/SITE";

export type InstallmentStatus = "paid" | "overdue" | "upcoming" | "near";

export interface FeeStudentInfo {
  name: string;
  image?: string | null;
  registrationNo: string;
}

export interface VoucherData {
  voucherId: string;
  installmentNo: number;
  amount: number;
  dueDate: string;
  printedAt?: string;
  institutionName?: string;
  student?: FeeStudentInfo;
}

export interface FullFeeVoucherData {
  voucherId: string;
  totalAmount: number;
  printedAt?: string;
  institutionName?: string;
  installments: VoucherData[];
  student?: FeeStudentInfo;
  semesterLabel?: string;
}

function getInstallmentStatus(
  dueDate: Date | string,
  installmentStatus?: string
): InstallmentStatus {
  if (installmentStatus === "PAID") return "paid";

  const now = new Date();
  const due = new Date(dueDate);
  if (due < now) return "overdue";
  const diff = due.getTime() - now.getTime();
  if (diff < 7 * 24 * 60 * 60 * 1000) return "near"; // within a week
  return "upcoming";
}

export async function studentGetFeeDetails() {
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
    return redirect("/unauthorized");
  }

  const data = await prisma.studentSemesterFee.findFirst({
    where: {
      studentId: student.id,
    },
    select: {
      id: true,
      totalDue: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      semesterFee: {
        select: {
          id: true,
          totalAmount: true,
          description: true,
          status: true,
          semester: {
            select: {
              semester: true,
              year: true,
              batch: true,
              program: true,
              department: true,
            },
          },
          feeInstallments: {
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
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              installmentNo: "asc",
            },
          },
        },
      },
      installments: {
        orderBy: {
          orderNo: "asc",
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          orderNo: true,
          paidAt: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          isBase: true,
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
            select: {
              id: true,
              status: true,
              requestedAmount: true,
              preferredDueDate: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      splitRequests: {
        select: {
          id: true,
          status: true,
          requestedAmount: true,
          preferredDueDate: true,
          createdAt: true,
          studentFeeInstallmentId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!data) {
    return {
      data: null,
    };
  }

  // Calculate display-ready fields
  const totalAmount = Number(data.semesterFee?.totalAmount || data.totalDue);
  const hasInstallments = data.installments.length > 0;
  const baseInstallments = data.semesterFee?.feeInstallments ?? [];
  // Process installments with status calculation
  const processedInstallments = data.installments.map((inst) => {
    const statusType = getInstallmentStatus(inst.dueDate, inst.status);

    const orderMatchedBaseInstallment = baseInstallments.find(
      (baseInstallment) => baseInstallment.installmentNo === inst.orderNo
    );

    // Fine policy comes from:
    // 1. Direct feeInstallment relation (normal case)
    // 2. OrderNo matching to base template (split-generated fallback)
    const finePolicySource =
      inst.feeInstallment ?? orderMatchedBaseInstallment ?? null;

    // Get fine policy from base installment or fallback
    const finePolicy = finePolicySource
      ? {
          fineType: finePolicySource.fineType as FinePolicyType | null,
          fineAmount: finePolicySource.fineAmount
            ? Number(finePolicySource.fineAmount)
            : null,
          fineMaxDays: finePolicySource.fineMaxDays
            ? Number(finePolicySource.fineMaxDays)
            : null,
          fineCapAmount: finePolicySource.fineCapAmount
            ? Number(finePolicySource.fineCapAmount)
            : null,
        }
      : {
          fineType: null,
          fineAmount: null,
          fineMaxDays: null,
          fineCapAmount: null,
        };

    const fineCalculation = calculateFine(inst.dueDate, new Date(), finePolicy);

    return {
      ...inst,
      amount: Number(inst.amount),
      statusType,
      finePolicy,
      fineCalculation,
      hasFinePolicy: !!finePolicy.fineType,
      fineAmount: fineCalculation.fineAmount,
      isOverdue: fineCalculation.isOverdue,
    };
  });

  // Calculate totals
  const paidAmount = processedInstallments.reduce((sum, inst) => {
    return sum + (inst.status === "PAID" ? inst.amount : 0);
  }, 0);

  const unpaidAmount = processedInstallments.reduce((sum, inst) => {
    return sum + (inst.status === "UNPAID" ? inst.amount : 0);
  }, 0);

  const remainingAmount = unpaidAmount;

  // Count overdue installments
  const overdueCount = processedInstallments.filter(
    (inst) => inst.statusType === "overdue"
  ).length;

  // Create voucher data
  const voucherDataList: VoucherData[] = processedInstallments.map((inst) => ({
    voucherId: inst.id,
    installmentNo: inst.orderNo,
    amount: inst.amount,
    dueDate: inst.dueDate.toISOString(),
    printedAt: new Date().toISOString(),
    institutionName: SITE_INFO.institution_name,
    student: {
      name: student.user.name,
      image: student.user.image,
      registrationNo: student.registrationNo,
    },
  }));

  // Filter unpaid installments for full fee voucher
  const unpaidInstallments = voucherDataList.filter((voucher) => {
    const displayedInst = processedInstallments.find(
      (d) => d.id === voucher.voucherId
    );
    return displayedInst?.status === "UNPAID";
  });

  const fullFeeVoucherData: FullFeeVoucherData = {
    voucherId: data.id,
    totalAmount: remainingAmount,
    printedAt: new Date().toISOString(),
    institutionName: SITE_INFO.institution_name,
    installments: unpaidInstallments,
    student: {
      name: student.user.name,
      image: student.user.image,
      registrationNo: student.registrationNo,
    },
    semesterLabel: data.semesterFee?.semester
      ? `Sem ${data.semesterFee.semester.semester} - ${data.semesterFee.semester.batch}${String(data.semesterFee.semester.year).slice(-2)} - ${data.semesterFee.semester.program}${data.semesterFee.semester.department}`
      : undefined,
  };

  // Create installment rows for table display
  const installmentRows = processedInstallments.map((inst) => ({
    id: inst.id,
    installmentNo: inst.orderNo,
    amount: inst.amount,
    dueDate: inst.dueDate,
    updatedAt: inst.updatedAt,
    status: inst.status,
    statusType: inst.statusType,
    fineType: inst.finePolicy.fineType,
    fineAmount: inst.finePolicy.fineAmount,
    fineMaxDays: inst.finePolicy.fineMaxDays,
    fineCapAmount: inst.finePolicy.fineCapAmount,
    fineCalculation: inst.fineCalculation,
    hasFinePolicy: inst.hasFinePolicy,
    isOverdue: inst.isOverdue,
    paidAt: inst.paidAt,
  }));

  return {
    data: {
      ...data,
      totalAmount,
      remainingAmount,
      paidAmount,
      hasInstallments,
      processedInstallments,
      installmentRows,
      overdueCount,
      installmentCount: processedInstallments.length,
      voucherDataList,
      fullFeeVoucherData,
      semesterLabel: data.semesterFee?.semester
        ? `Sem ${data.semesterFee.semester.semester} - ${data.semesterFee.semester.batch}${String(data.semesterFee.semester.year).slice(-2)} - ${data.semesterFee.semester.program}${data.semesterFee.semester.department}`
        : undefined,
      splitRequests: data.splitRequests,
    },
    student: {
      name: student.user.name,
      image: student.user.image,
      registrationNo: student.registrationNo,
    },
  };
}

export type StudentFeeDetails = Awaited<
  ReturnType<typeof studentGetFeeDetails>
>;
