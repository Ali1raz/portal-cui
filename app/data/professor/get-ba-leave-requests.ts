import "server-only";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import type { Prisma } from "@/lib/generated/prisma/client";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import type { BaLeaveRequestsSearchParams } from "@/app/(professor)/batch-advisor/leave-requests/leave-requests-search-params";

/// Fetch paginated BA leave requests with filters from their department.
export async function baGetLeaveRequests({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  status,
  dateFrom,
  dateTo,
}: BaLeaveRequestsSearchParams) {
  const session = await requireSession();

  const ba = await prisma.professor.findUnique({
    where: { userId: session.user.id },
    select: {
      department: true,
      batchAdvisor: { select: { id: true } },
    },
  });

  const can = await requirePermission({
    leaveRequest: ["list"],
  });

  if (!can || !ba || !ba.department || !ba.batchAdvisor) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  const parsedStatuses = status
    .split(",")
    .map((value) => value.trim())
    .filter((value) =>
      Object.values(LeaveStatus).includes(value as LeaveStatus)
    )
    .map((value) => value as LeaveStatus);

  const parseDate = (value: string) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const dateFromValue = parseDate(dateFrom);
  const dateToValue = parseDate(dateTo);

  const where: Prisma.LeaveRequestWhereInput = {
    student: {
      department: ba.department,
    },
    ...(trimmedQuery
      ? {
          OR: [
            {
              reasonTitle: { contains: trimmedQuery, mode: "insensitive" },
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
    ...(parsedStatuses.length
      ? {
          status: {
            in: parsedStatuses,
          },
        }
      : {}),
    ...(dateFromValue || dateToValue
      ? {
          date: {
            ...(dateFromValue ? { gte: dateFromValue } : {}),
            ...(dateToValue ? { lte: dateToValue } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.LeaveRequestOrderByWithRelationInput =
    sortBy === "studentName"
      ? { student: { user: { name: direction } } }
      : sortBy === "reasonTitle"
        ? { reasonTitle: direction }
        : sortBy === "date"
          ? { date: direction }
          : sortBy === "status"
            ? { status: direction }
            : { createdAt: direction };

  const [leaveRequests, totalCount] = await Promise.all([
    prisma.leaveRequest.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        reasonTitle: true,
        date: true,
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
    prisma.leaveRequest.count({ where }),
  ]);

  return {
    leaveRequests,
    totalCount,
  };
}

export type BaLeaveRequestRow = Awaited<
  ReturnType<typeof baGetLeaveRequests>
>["leaveRequests"][number];
