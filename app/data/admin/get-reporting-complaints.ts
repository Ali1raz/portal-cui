import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  ComplaintCategory,
  ComplaintStatus,
  Department,
} from "@/lib/generated/prisma/enums";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { ReportingComplaintsSearchParams } from "@/app/(admin)/admin/reporting/complaints/complaints-search-params";

export type AdminReportingComplaintType = Awaited<
  ReturnType<typeof getAdminReportingComplaints>
>["complaints"][number];

function parseDateValue(value: string) {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function getAdminReportingComplaints({
  page,
  pageSize,
  sortBy,
  sortDir,
  status,
  category,
  department,
  dateFrom,
  dateTo,
  hasAttachment,
  query,
}: ReportingComplaintsSearchParams) {
  await requireSession();

  const can = await requirePermission({
    complaints: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;

  const trimmedQuery = query.trim();
  const trimmedDepartment = department.trim();

  const statusFilter =
    status &&
    status !== "all" &&
    Object.values(ComplaintStatus).includes(status as ComplaintStatus)
      ? (status as ComplaintStatus)
      : undefined;

  const categoryFilter =
    category &&
    category !== "all" &&
    Object.values(ComplaintCategory).includes(category as ComplaintCategory)
      ? (category as ComplaintCategory)
      : undefined;

  const departmentFilter =
    trimmedDepartment &&
    Object.values(Department).includes(trimmedDepartment as Department)
      ? (trimmedDepartment as Department)
      : undefined;

  const from = parseDateValue(dateFrom);
  const to = parseDateValue(dateTo);

  const where: Prisma.ComplaintWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
    ...(departmentFilter
      ? {
          student: {
            department: departmentFilter,
          },
        }
      : {}),
    ...(from ? { createdAt: { gte: from } } : {}),
    ...(to ? { createdAt: { lte: to } } : {}),
    ...(hasAttachment === "with"
      ? {
          AND: [{ imageKey: { not: null } }, { imageKey: { not: "" } }],
        }
      : {}),
    ...(hasAttachment === "without"
      ? {
          OR: [{ imageKey: null }, { imageKey: "" }],
        }
      : {}),
    ...(trimmedQuery
      ? {
          OR: [
            {
              title: { contains: trimmedQuery, mode: "insensitive" },
            },
            {
              details: { contains: trimmedQuery, mode: "insensitive" },
            },
            {
              student: {
                user: {
                  name: { contains: trimmedQuery, mode: "insensitive" },
                },
              },
            },
            {
              student: {
                registrationNo: {
                  contains: trimmedQuery,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ComplaintOrderByWithRelationInput =
    sortBy === "studentName"
      ? { student: { user: { name: direction } } }
      : sortBy === "department"
        ? { student: { department: direction } }
        : { [sortBy]: direction };

  const [complaints, totalCount] = await Promise.all([
    prisma.complaint.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      where,
      orderBy,
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
            department: true,
            user: {
              select: {
                id: true,
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

  return { complaints, totalCount };
}
