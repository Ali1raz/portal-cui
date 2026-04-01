import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import type { ClerkApplicationsSearchParams } from "@/app/(clerk)/clerk/applications/clerk-applications-search-params";

type GetClerkApplicationsParams = Pick<
  ClerkApplicationsSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "query"
  | "status"
  | "department"
  | "submittedFrom"
  | "submittedTo"
>;

export async function getClerkApplications({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  status,
  department,
  submittedFrom,
  submittedTo,
}: GetClerkApplicationsParams) {
  await requireSession();
  const can = await requirePermission({ applications: ["list"] });

  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  const parseDate = (value: string) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const submittedFromDate = parseDate(submittedFrom);
  const submittedToDate = parseDate(submittedTo);

  if (submittedToDate) {
    submittedToDate.setHours(23, 59, 59, 999);
  }

  const submittedDateRangeFilter =
    submittedFromDate || submittedToDate
      ? {
          OR: [
            {
              submittedAt: {
                ...(submittedFromDate ? { gte: submittedFromDate } : {}),
                ...(submittedToDate ? { lte: submittedToDate } : {}),
              },
            },
            {
              AND: [
                { submittedAt: null },
                {
                  createdAt: {
                    ...(submittedFromDate ? { gte: submittedFromDate } : {}),
                    ...(submittedToDate ? { lte: submittedToDate } : {}),
                  },
                },
              ],
            },
          ],
        }
      : undefined;

  const where: Prisma.StudentApplicationWhereInput = {
    ...(status ? { status } : {}),
    ...(department ? { preferredDepartment: department } : {}),
    ...(trimmedQuery
      ? {
          OR: [{ fullName: { contains: trimmedQuery, mode: "insensitive" } }],
        }
      : {}),
    ...(submittedDateRangeFilter ?? {}),
  };

  const submittedAtOrderBy: Prisma.StudentApplicationOrderByWithRelationInput[] =
    direction === "asc"
      ? [{ submittedAt: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }]
      : [
          { submittedAt: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
        ];

  const orderBy: Prisma.StudentApplicationOrderByWithRelationInput[] =
    sortBy === "fullName"
      ? [{ fullName: direction }]
      : sortBy === "preferredDepartment"
        ? [{ preferredDepartment: direction }]
        : sortBy === "status"
          ? [{ status: direction }]
          : sortBy === "submittedAt"
            ? submittedAtOrderBy
            : [
                { submittedAt: { sort: "desc", nulls: "last" } },
                { createdAt: "desc" },
              ];

  const [applications, totalCount] = await Promise.all([
    prisma.studentApplication.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      where,
      orderBy,
      select: {
        id: true,
        fullName: true,
        preferredDepartment: true,
        status: true,
        submittedAt: true,
        createdAt: true,
      },
    }),
    prisma.studentApplication.count({ where }),
  ]);

  return { applications, totalCount };
}

export type ClerkApplicationListItem = Awaited<
  ReturnType<typeof getClerkApplications>
>["applications"][number];
