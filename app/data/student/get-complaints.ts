import "server-only";

import { requireSession } from "../session/require-session";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  ComplaintCategory,
  ComplaintStatus,
} from "@/lib/generated/prisma/enums";
import type { ComplaintsSearchParams } from "@/app/(student)/student/complaints/complaints-search-params";

type StudentComplaintsParams = Pick<
  ComplaintsSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "status"
  | "category"
  | "dateFrom"
  | "dateTo"
  | "hasAttachment"
>;

function parseDateValue(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Fetch paginated student complaints with filters.
export async function studentsGetComplaints({
  page,
  pageSize,
  sortBy,
  sortDir,
  status,
  category,
  dateFrom,
  dateTo,
  hasAttachment,
}: StudentComplaintsParams) {
  const session = await requireSession();
  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  const can = await requirePermission({
    complaints: ["list:own"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  if (!student) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;

  const statusValues = new Set(Object.values(ComplaintStatus));
  const statusFilters = status
    .split(",")
    .map((value) => value.trim())
    .filter((value) => statusValues.has(value as ComplaintStatus));

  const categoryValues = new Set(Object.values(ComplaintCategory));
  const categoryFilters = category
    .split(",")
    .map((value) => value.trim())
    .filter((value) => categoryValues.has(value as ComplaintCategory));

  const dateFromValue = parseDateValue(dateFrom);
  const dateToValue = parseDateValue(dateTo);

  const createdAtFilter =
    dateFromValue || dateToValue
      ? {
          createdAt: {
            ...(dateFromValue ? { gte: dateFromValue } : {}),
            ...(dateToValue ? { lte: dateToValue } : {}),
          },
        }
      : {};

  const attachmentFilter =
    hasAttachment === "with"
      ? {
          AND: [{ imageKey: { not: null } }, { imageKey: { not: "" } }],
        }
      : hasAttachment === "without"
        ? {
            OR: [{ imageKey: null }, { imageKey: "" }],
          }
        : {};

  const where: Prisma.ComplaintWhereInput = {
    studentId: student.id,
    ...(statusFilters.length
      ? { status: { in: statusFilters as ComplaintStatus[] } }
      : {}),
    ...(categoryFilters.length
      ? { category: { in: categoryFilters as ComplaintCategory[] } }
      : {}),
    ...createdAtFilter,
    ...attachmentFilter,
  };

  const orderBy: Prisma.ComplaintOrderByWithRelationInput =
    sortBy === "title"
      ? { title: direction }
      : sortBy === "category"
        ? { category: direction }
        : sortBy === "status"
          ? { status: direction }
          : { createdAt: direction };

  const [complaints, totalCount] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        category: true,
        imageKey: true,
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, totalCount };
}

export type StudentComplaintsRow = Awaited<
  ReturnType<typeof studentsGetComplaints>
>["complaints"][number];
