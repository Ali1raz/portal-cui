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
import type { HodComplaintsSearchParams } from "@/app/(HOD)/hod/complaints/complaints-search-params";

type HodComplaintsParams = Pick<
  HodComplaintsSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "status"
  | "category"
  | "dateFrom"
  | "dateTo"
  | "hasAttachment"
  | "query"
>;

function parseDateValue(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Fetch paginated HOD complaints with filters from their department.
export async function hodGetComplaints({
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
}: HodComplaintsParams) {
  const session = await requireSession();
  const hod = await prisma.hod.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      department: true,
    },
  });

  const can = await requirePermission({
    complaints: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  if (!hod) {
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

  const from = parseDateValue(dateFrom);
  const to = parseDateValue(dateTo);

  // HOD only sees complaints that the BA has accepted (forwarded)
  const HOD_VISIBLE_STATUSES: ComplaintStatus[] = [
    ComplaintStatus.HOD_PENDING,
    ComplaintStatus.HOD_ACCEPTED,
    ComplaintStatus.HOD_REJECTED,
    ComplaintStatus.ASSIGNED,
  ];

  const where: Prisma.ComplaintWhereInput = {
    student: {
      department: hod.department, // Only show complaints from the HOD's department
    },
    // Base constraint: only show BA-accepted complaints
    status:
      statusFilters.length > 0
        ? {
            in: statusFilters.filter((s) =>
              HOD_VISIBLE_STATUSES.includes(s as ComplaintStatus)
            ) as ComplaintStatus[],
          }
        : { in: HOD_VISIBLE_STATUSES },
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
        imageKey: true,
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

/// Return type for HOD complaints query result.
export type HodComplaintRow = Awaited<
  ReturnType<typeof hodGetComplaints>
>["complaints"][number];
