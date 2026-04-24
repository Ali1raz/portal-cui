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
    fee: ["view"],
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
          OR: [
            {
              feeInstallment: {
                semesterFeeId: semesterId,
              },
            },
            {
              studentFeeInstallment: {
                semesterFeeId: semesterId,
              },
            },
          ],
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

  const orderBy: Prisma.InstallmentSplitRequestOrderByWithRelationInput =
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
          ? {
              feeInstallment: {
                semesterFee: {
                  semester: {
                    semester: direction,
                  },
                },
              },
            }
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
        reason: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            registrationNo: true,
            user: {
              select: {
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        feeInstallment: {
          select: {
            installmentNo: true,
            amount: true,
            dueDate: true,
            semesterFee: {
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
              },
            },
          },
        },
        studentFeeInstallment: {
          select: {
            orderNo: true,
            amount: true,
            dueDate: true,
            status: true,
            semesterFee: {
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
              },
            },
          },
        },
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            remarks: true,
            actorRole: true,
            action: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    }),
    prisma.installmentSplitRequest.count({ where }),
  ]);

  return {
    requests: requests.map((request) => ({
      ...request,
      requestedAmount: Number(request.requestedAmount),
      feeInstallment: request.feeInstallment
        ? {
            ...request.feeInstallment,
            amount: Number(request.feeInstallment.amount),
            semesterFee: {
              ...request.feeInstallment.semesterFee,
              totalAmount: Number(
                request.feeInstallment.semesterFee.totalAmount
              ),
            },
          }
        : null,
      studentFeeInstallment: request.studentFeeInstallment
        ? {
            ...request.studentFeeInstallment,
            amount: Number(request.studentFeeInstallment.amount),
            semesterFee: {
              ...request.studentFeeInstallment.semesterFee,
              totalAmount: Number(
                request.studentFeeInstallment.semesterFee.totalAmount
              ),
            },
          }
        : null,
    })),
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

  const semesterFees = await prisma.semesterFee.findMany({
    where: {
      semester: {
        department: hod.department,
      },
      OR: [
        {
          feeInstallments: {
            some: {
              installmentSplitRequests: {
                some: {
                  student: {
                    department: hod.department,
                  },
                },
              },
            },
          },
        },
        {
          studentFeeInstallments: {
            some: {
              installmentSplitRequests: {
                some: {
                  student: {
                    department: hod.department,
                  },
                },
              },
            },
          },
        },
      ],
    },
    orderBy: [
      {
        semester: {
          year: "desc",
        },
      },
      {
        semester: {
          semester: "desc",
        },
      },
    ],
    select: {
      id: true,
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
  });

  return semesterFees.map((semesterFee) => ({
    id: semesterFee.id,
    label: `Sem ${semesterFee.semester.semester} (${semesterFee.semester.batch}${semesterFee.semester.year
      .toString()
      .slice(
        -2
      )}-${semesterFee.semester.program}${semesterFee.semester.department})`,
  }));
}

export type HodFeeSplitRequestRow = Awaited<
  ReturnType<typeof hodGetFeeSplitRequests>
>["requests"][number];
