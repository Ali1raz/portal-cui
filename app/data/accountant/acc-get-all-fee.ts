import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import { FeeSearchParams } from "@/app/(accountant)/accountant/manage-fee/fee-search-params";

const statusValues = new Set(Object.values(SemesterFeeStatus));

type AccountantGetFeesParams = Pick<
  FeeSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "status" | "semesterId"
>;

/// Fetch paginated accountant fees with filters and sorting.
export async function accountantGetFees({
  page,
  pageSize,
  sortBy,
  sortDir,
  status,
  semesterId,
}: AccountantGetFeesParams) {
  const session = await requireSession();

  const can = await requirePermission({
    fee: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const accountant = await prisma.accountant.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!accountant) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir === "desc" ? "desc" : "asc";

  const statusFilters = status
    .split(",")
    .map((value) => value.trim())
    .filter((value) => statusValues.has(value as SemesterFeeStatus));

  const where: Prisma.SemesterFeeWhereInput = {
    accountantId: accountant.id,
    ...(statusFilters.length > 0 && {
      status: { in: statusFilters as SemesterFeeStatus[] },
    }),
    ...(semesterId ? { semesterId } : {}),
  };

  const orderBy: Prisma.SemesterFeeOrderByWithRelationInput =
    sortBy === "semester"
      ? { semester: { semester: direction } }
      : sortBy === "totalAmount"
        ? { totalAmount: direction }
        : sortBy === "status"
          ? { status: direction }
          : { createdAt: direction };

  const [fees, totalCount] = await Promise.all([
    prisma.semesterFee.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        semester: {
          select: {
            id: true,
            semester: true,
            program: true,
            year: true,
            batch: true,
            department: true,
          },
        },
        _count: {
          select: {
            feeInstallments: true,
          },
        },
      },
    }),
    prisma.semesterFee.count({ where }),
  ]);

  const serializedFees = fees.map((fee) => ({
    ...fee,
    totalAmount: fee.totalAmount.toNumber(),
  }));

  return { fees: serializedFees, totalCount };
}

export type AccountantGetFeesType = Awaited<
  ReturnType<typeof accountantGetFees>
>["fees"][number];
