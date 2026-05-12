import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import type { HodFeeSplitSearchParams } from "@/app/(HOD)/hod/fee/fee-split-requests-search-params";

type HodFeeSplitRequestsParams = Pick<
  HodFeeSplitSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "status" | "semesterId" | "query"
>;

/// Fetch paginated installment split requests scoped to current HOD department.
export async function hodGetFeeSplitRequests({
  page,
  pageSize,
  sortBy,
  sortDir,
  status,
  semesterId,
  query,
}: HodFeeSplitRequestsParams) {
  const session = await requireSession();

  const can = await requirePermission({
    installments: ["view", "list"],
  });

  if (!can) {
    return redirect("/unauthorized");
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
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;

  const where: Prisma.InstallmentSplitRequestWhereInput = {
    student: {
      department: hod.department,
    },
    ...(status !== "all"
      ? {
          status,
        }
      : {}),
    ...(semesterId
      ? {
          studentFeeInstallment: {
            studentSemesterFee: {
              semesterFeeId: semesterId,
            },
          },
        }
      : {}),
    ...(query.trim().length > 0
      ? {
          OR: [
            {
              student: {
                user: {
                  name: {
                    contains: query.trim(),
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              student: {
                registrationNo: {
                  contains: query.trim(),
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy:
    | Prisma.InstallmentSplitRequestOrderByWithRelationInput
    | Prisma.InstallmentSplitRequestOrderByWithRelationInput[] =
    sortBy === "studentName"
      ? {
          student: {
            user: {
              name: direction,
            },
          },
        }
      : sortBy === "registrationNo"
        ? {
            student: {
              registrationNo: direction,
            },
          }
        : sortBy === "semester"
          ? [
              {
                studentFeeInstallment: {
                  studentSemesterFee: {
                    semesterFee: {
                      semester: {
                        semester: direction,
                      },
                    },
                  },
                },
              },
              {
                createdAt: "desc",
              },
            ]
          : {
              [sortBy]: direction,
            };

  const [requests, totalCount] = await Promise.all([
    prisma.installmentSplitRequest.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        requestedAmount: true,
        preferredDueDate: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            registrationNo: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        studentFeeInstallment: {
          select: {
            studentSemesterFee: {
              select: {
                totalDue: true,
              },
            },
          },
        },
      },
    }),
    prisma.installmentSplitRequest.count({
      where,
    }),
  ]);

  // Convert Decimal to string for client serialization
  const requests_serialized = requests.map((req) => ({
    id: req.id,
    requestedAmount: req.requestedAmount.toString(),
    preferredDueDate: req.preferredDueDate,
    status: req.status,
    createdAt: req.createdAt,
    student: req.student,
    totalAmount:
      req.studentFeeInstallment?.studentSemesterFee?.totalDue.toString() ?? "0",
  }));

  return {
    requests: requests_serialized,
    totalCount,
  };
}

/// Fetch semester options available for HOD fee split request filtering.
export async function hodGetFeeSplitSemesterOptions() {
  const session = await requireSession();

  const can = await requirePermission({
    fee: ["view"],
  });

  if (!can) {
    return [];
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
    return [];
  }
  const semesters = await prisma.semester.findMany({
    where: {
      department: hod.department,
    },
    select: {
      id: true,
      semester: true,
      year: true,
      batch: true,
      program: true,
      department: true,
    },
  });

  return semesters.map((semester) => ({
    id: semester.id,
    label: `Sem ${semester.semester} (${semester.batch}${semester.year
      .toString()
      .slice(-2)}-${semester.program ?? ""}${semester.department})`,
  }));
}

export type HodFeeSplitRequestRow = Awaited<
  ReturnType<typeof hodGetFeeSplitRequests>
>["requests"][number];
