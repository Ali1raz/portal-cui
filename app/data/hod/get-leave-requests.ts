import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { LeaveRequestSearchParams } from "@/app/(HOD)/hod/leave-requests/leave-request-search-params";

type GetLeaveRequestsParams = Pick<
  LeaveRequestSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "query"
  | "status"
  | "startDate"
  | "endDate"
>;

/// Fetches paginated, filtered, and sorted leave requests for HOD view
export async function getLeaveRequests({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  status,
  startDate,
  endDate,
}: GetLeaveRequestsParams) {
  const session = await requireSession();
  const can = await requirePermission({
    leaveRequest: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const hod = await prisma.hod.findUnique({
    where: { userId: session.user.id },
    select: { department: true },
  });

  if (!hod) {
    throw new Error("HOD not found");
  }

  // Sanitize inputs
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  // Build where clause
  const where: Prisma.LeaveRequestWhereInput = {
    student: {
      department: hod.department,
    },
    // Text search
    ...(trimmedQuery
      ? {
          OR: [
            {
              student: {
                user: {
                  name: { contains: trimmedQuery, mode: "insensitive" },
                },
              },
            },
            {
              student: {
                registrationNo: { contains: trimmedQuery, mode: "insensitive" },
              },
            },
            {
              offering: {
                subject: {
                  name: { contains: trimmedQuery, mode: "insensitive" },
                },
              },
            },
            {
              offering: {
                subject: {
                  code: { contains: trimmedQuery, mode: "insensitive" },
                },
              },
            },
            {
              reasonTitle: { contains: trimmedQuery, mode: "insensitive" },
            },
          ],
        }
      : {}),
    // Status filter
    ...(status ? { status } : {}),
    // Date range filter
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  // Build orderBy (handle relation sorting)
  const orderBy: Prisma.LeaveRequestOrderByWithRelationInput =
    sortBy === "studentName"
      ? { student: { user: { name: direction } } }
      : sortBy === "subject"
        ? { offering: { subject: { name: direction } } }
        : sortBy === "date"
          ? { date: direction }
          : sortBy === "status"
            ? { status: direction }
            : { createdAt: direction };

  // Fetch data + count in parallel
  const [requests, totalCount] = await Promise.all([
    prisma.leaveRequest.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        date: true,
        reasonTitle: true,
        status: true,
        createdAt: true,
        offering: {
          select: {
            id: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
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
    prisma.leaveRequest.count({ where }),
  ]);

  return { requests, totalCount };
}

export type GetLeaveRequestsType = Awaited<
  ReturnType<typeof getLeaveRequests>
>["requests"][number];
