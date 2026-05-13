import "server-only";
import { requireSession } from "../session/require-session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  ComplaintCategory,
  ComplaintStatus,
} from "@/lib/generated/prisma/enums";
import type { BaComplaintsSearchParams } from "@/app/(professor)/batch-advisor/complaints/ba-complaints-search-params";
import { requirePermission } from "../permission/require-permission";

/// Fetch paginated BA complaints with filters from their department.
export async function baGetComplaints({
  page,
  pageSize,
  sortBy,
  sortDir,
  status,
  category,
  dateFrom,
  dateTo,
  hasAttachment,
  query,
}: BaComplaintsSearchParams) {
  const session = await requireSession();
  const ba = await prisma.professor.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      department: true,
      batchAdvisor: { select: { id: true } },
    },
  });

  const can = await requirePermission({
    complaints: ["list"],
  });

  if (!can || !ba || !ba.department) {
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

  function parseDateValue(value: string) {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const from = parseDateValue(dateFrom);
  const to = parseDateValue(dateTo);

  const where: Prisma.ComplaintWhereInput = {
    student: {
      department: ba.department,
    },
    ...(statusFilters.length > 0 && {
      status: { in: statusFilters as ComplaintStatus[] },
    }),
    ...(categoryFilters.length > 0 && {
      category: { in: categoryFilters as ComplaintCategory[] },
    }),
    ...(from && {
      createdAt: { gte: from },
    }),
    ...(to && {
      createdAt: { lte: to },
    }),
    ...(hasAttachment === "with" && {
      AND: [{ imageKey: { not: null } }, { imageKey: { not: "" } }],
    }),
    ...(hasAttachment === "without" && {
      OR: [{ imageKey: null }, { imageKey: "" }],
    }),
    ...(query &&
      query.trim().length > 0 && {
        OR: [
          { title: { contains: query.trim(), mode: "insensitive" } },
          { details: { contains: query.trim(), mode: "insensitive" } },
          {
            student: {
              user: { name: { contains: query.trim(), mode: "insensitive" } },
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
      }),
  };

  /// Sorting configuration for different fields.
  const orderBy: Prisma.ComplaintOrderByWithRelationInput =
    sortBy === "studentName"
      ? { student: { user: { name: direction } } }
      : { [sortBy]: direction };

  const [complaints, totalCount] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        title: true,
        category: true,
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
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    complaints,
    totalCount,
  };
}

/// Return type for BA complaints query result.
export type BaComplaintRow = Awaited<
  ReturnType<typeof baGetComplaints>
>["complaints"][number];
