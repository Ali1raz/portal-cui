import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import { requireSession } from "../session/require-session";

export type StudentFeeSplitContext = {
  studentId: string;
  semesterFeeId: string;
  studentSemesterFeeId: string;
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
  const data = await prisma.studentSemesterFee.findFirst({
    where: {
      studentId,
      semesterFee: {
        status: "PUBLISHED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      semesterFeeId: true,
      totalDue: true,
      semesterFee: {
        select: {
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
        },
      },
      installments: {
        where: {
          status: "UNPAID",
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

  const totalAmount = Number(data.semesterFee.totalAmount ?? data.totalDue);
  const unpaidAmount = data.installments.reduce(
    (sum, installment) => sum + Number(installment.amount),
    0
  );

  const remainingAmount = data.installments.length
    ? Math.max(unpaidAmount, 0)
    : totalAmount;

  const semester = data.semesterFee.semester;
  const semesterLabel = `Sem ${semester.semester} (${semester.batch}${semester.year
    .toString()
    .slice(-2)}-${semester.program ?? ""}${semester.department})`;

  return {
    studentId,
    semesterFeeId: data.semesterFeeId,
    studentSemesterFeeId: data.id,
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
