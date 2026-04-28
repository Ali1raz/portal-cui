import "server-only";

import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";

export type InstallmentStatus = "paid" | "overdue" | "upcoming" | "near";

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

  const data = await prisma.semesterFee.findFirst({
    where: {
      status: "PUBLISHED",
      semester: {
        registrations: {
          some: {
            studentId: student.id,
          },
        },
      },
    },

    select: {
      id: true,
      totalAmount: true,
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
        },
        orderBy: {
          installmentNo: "asc",
        },
      },
      studentFeeInstallments: {
        where: {
          studentId: student.id,
        },
        orderBy: {
          orderNo: "asc",
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          orderNo: true,
          status: true,
          updatedAt: true,
          installmentSplitRequests: {
            select: {
              id: true,
              status: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!data) {
    return null;
  }

  const installmentSplitRequests =
    await prisma.installmentSplitRequest.findMany({
      where: {
        studentId: student.id,
        OR: [
          {
            feeInstallment: {
              semesterFeeId: data.id,
            },
          },
          {
            studentFeeInstallment: {
              semesterFeeId: data.id,
            },
          },
          {
            feeInstallmentId: null,
            studentFeeInstallmentId: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        requestedAmount: true,
        preferredDueDate: true,
        feeInstallmentId: true,
        studentFeeInstallmentId: true,
        createdAt: true,
      },
    });

  // Pre-calculate everything for rendering
  const totalAmount = Number(data.totalAmount);
  const hasStudentInstallments = data.studentFeeInstallments.length > 0;

  const baseInstallments = data.feeInstallments
    .slice()
    .sort((a, b) => a.installmentNo - b.installmentNo)
    .map((inst) => ({
      id: inst.id,
      installmentNo: inst.installmentNo,
      amount: Number(inst.amount),
      dueDate: inst.dueDate,
      updatedAt: null,
      status: "UNPAID" as const,
    }));

  type DisplayedInstallment = {
    id: string;
    installmentNo: number;
    amount: number;
    dueDate: Date;
    updatedAt: Date | null;
    status: string | undefined;
    installmentSplitRequests?: {
      id: string;
      status: string;
    }[];
  };

  const displayedInstallments: DisplayedInstallment[] = hasStudentInstallments
    ? data.studentFeeInstallments
        .slice()
        .sort((a, b) => a.orderNo - b.orderNo)
        .map((inst) => ({
          id: inst.id,
          installmentNo: inst.orderNo,
          amount: Number(inst.amount),
          dueDate: inst.dueDate,
          updatedAt: inst.updatedAt,
          status: inst.status,
        }))
    : baseInstallments;

  const unpaidAmount = displayedInstallments.reduce((sum, inst) => {
    return sum + (inst.status === "UNPAID" ? inst.amount : 0);
  }, 0);

  const remainingAmount = Math.max(unpaidAmount, 0);

  // If student installments exist and only 1, add remaining as second
  if (
    hasStudentInstallments &&
    displayedInstallments.length === 1 &&
    displayedInstallments[0].status === "PAID" &&
    remainingAmount > 0
  ) {
    const firstInstallment = displayedInstallments[0];
    const secondDueDate = new Date(
      firstInstallment.dueDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    displayedInstallments.push({
      id: "remaining",
      installmentNo: 2,
      amount: remainingAmount,
      dueDate: secondDueDate,
      updatedAt: null,
      status: "UNPAID",
    });
  }

  const semesterLabel =
    data.semester &&
    `Sem ${data.semester.semester} - ${data.semester.batch}${String(data.semester.year).slice(-2)} - ${data.semester.program} - ${data.semester.department}`;

  // Calculate installment rows with status
  const installmentRows = displayedInstallments.map((inst) => ({
    id: inst.id,
    installmentNo: inst.installmentNo,
    amount: inst.amount,
    dueDate: inst.dueDate,
    updatedAt: inst.updatedAt,
    status: inst.status,
    statusType: getInstallmentStatus(inst.dueDate, inst.status),
  }));

  const overdueCount = installmentRows.filter(
    (row) => row.statusType === "overdue"
  ).length;

  return {
    ...data,
    totalAmount,
    remainingAmount,
    hasStudentInstallments,
    displayedInstallments,
    installmentSplitRequests,
    installmentRows,
    overdueCount,
    installmentCount: displayedInstallments.length,
    semesterLabel,
    feeInstallments: baseInstallments,
    studentFeeInstallments: data.studentFeeInstallments.map((inst) => ({
      ...inst,
      amount: Number(inst.amount),
    })),
    student: {
      name: student.user.name,
      image: student.user.image,
      registrationNo: student.registrationNo,
    },
  };
}

export type StudentFeeDetails = NonNullable<
  Awaited<ReturnType<typeof studentGetFeeDetails>>
>;

export type StudentInstallment =
  StudentFeeDetails["studentFeeInstallments"][number] & {
    statusType: InstallmentStatus;
  };
