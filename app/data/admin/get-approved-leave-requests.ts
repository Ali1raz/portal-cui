import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";

export type GetApprovedLeaveRequestsType = Awaited<
  ReturnType<typeof getApprovedLeaveRequests>
>["requests"][0];

type GetApprovedLeaveRequestsParams = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  query: string;
  startDate?: Date | null;
  endDate?: Date | null;
};

/// Fetches paginated, filtered, and sorted approved leave requests for admin view
export async function getApprovedLeaveRequests({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  startDate,
  endDate,
}: GetApprovedLeaveRequestsParams) {
  await requireSession();
  const can = await requirePermission({
    leaveRequest: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  // Sanitize inputs
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  // Build where clause
  const where: Prisma.LeaveRequestWhereInput = {
    status: "APPROVED",
    // Date range filter
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
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
  };

  // Get total count
  const totalCount = await prisma.leaveRequest.count({ where });

  // Fetch leave requests with related data
  const requests = await prisma.leaveRequest.findMany({
    where,
    include: {
      student: {
        include: {
          user: true,
        },
      },
      offering: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: {
      [sortBy]: direction,
    },
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  });

  // For each leave request, fetch the attendance status
  const requestsWithAttendance = await Promise.all(
    requests.map(async (request) => {
      // Find the attendance record for this date and offering
      const requestDateStart = new Date(request.date);
      requestDateStart.setHours(0, 0, 0, 0);

      const requestDateEnd = new Date(request.date);
      requestDateEnd.setHours(23, 59, 59, 999);

      const attendanceRecord = await prisma.attendanceRecord.findFirst({
        where: {
          offeringId: request.offeringId,
          date: {
            gte: requestDateStart,
            lte: requestDateEnd,
          },
        },
        include: {
          attendances: {
            where: {
              studentId: request.studentId,
            },
          },
        },
      });

      const attendanceStatus = attendanceRecord?.attendances[0]?.status || null;

      return {
        ...request,
        attendanceStatus,
        attendanceRecordId: attendanceRecord?.id || null,
      };
    })
  );

  return {
    requests: requestsWithAttendance,
    totalCount,
  };
}
