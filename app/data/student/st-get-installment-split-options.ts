import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import { requireSession } from "../session/require-session";

export type StudentFeeSplitContext = {
  studentId: string;
  semesterFeeId: string;
  semesterLabel: string;
  totalAmount: number;
  remainingAmount: number;
  semester: {
    semester: number;
    year: number;
    batch: string;
    program: string | null;
    department: string;
  };
};

export async function getStudentFeeSplitContextByStudentId(
  studentId: string
): Promise<StudentFeeSplitContext | null> {
  const data = await prisma.semesterFee.findFirst({
    where: {
      status: "PUBLISHED",
      semester: {
        registrations: {
          some: {
            studentId,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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
      studentFeeInstallments: {
        where: {
          studentId,
        },
        orderBy: {
          orderNo: "asc",
        },
        select: {
          amount: true,
          status: true,
          orderNo: true,
        },
      },
    },
  });

  if (!data) {
    return null;
  }

  const totalAmount = Number(data.totalAmount);
  const unpaidAmount = data.studentFeeInstallments.reduce(
    (sum, installment) => {
      return (
        sum + (installment.status === "UNPAID" ? Number(installment.amount) : 0)
      );
    },
    0
  );

  const remainingAmount = data.studentFeeInstallments.length
    ? Math.max(unpaidAmount, 0)
    : totalAmount;
  const semester = data.semester;
  const semesterLabel = `Sem ${semester.semester} (${semester.batch}${semester.year
    .toString()
    .slice(-2)}-${semester.program}${semester.department})`;

  return {
    studentId,
    semesterFeeId: data.id,
    semesterLabel,
    totalAmount,
    remainingAmount,
    semester,
  };
}

export async function studentGetFeeSplitContext() {
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
    return null;
  }

  return getStudentFeeSplitContextByStudentId(student.id);
}

export type StudentFeeSplitContextType = Awaited<
  ReturnType<typeof studentGetFeeSplitContext>
>;
