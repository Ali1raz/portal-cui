import "server-only";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireStudentSession } from "./require-student-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import type { StudentLeaveRequestsSearchParams } from "@/app/(student)/student/past-leave-requests/leave-requests-search-params";

type StudentLeaveRequestsParams = Pick<
  StudentLeaveRequestsSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "query"
>;

/// Fetch paginated student leave requests with filters.
export async function getStudentLeaveRequests({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
}: StudentLeaveRequestsParams) {
  const session = await requireStudentSession();

  const can = await requirePermission({
    leaveRequest: ["list", "get"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  const where: Prisma.LeaveRequestWhereInput = {
    student: { userId: session.user.id },
    ...(trimmedQuery
      ? {
          OR: [
            { reasonTitle: { contains: trimmedQuery, mode: "insensitive" } },
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
          ],
        }
      : {}),
  };

  const orderBy: Prisma.LeaveRequestOrderByWithRelationInput =
    sortBy === "subject"
      ? { offering: { subject: { name: direction } } }
      : sortBy === "title"
        ? { reasonTitle: direction }
        : sortBy === "date"
          ? { date: direction }
          : sortBy === "status"
            ? { status: direction }
            : { createdAt: direction };

  const [requests, totalCount] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      select: {
        id: true,
        date: true,
        reasonTitle: true,
        status: true,
        createdAt: true,
        offering: {
          select: {
            subject: {
              select: {
                name: true,
                code: true,
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

export type StudentLeaveRequest = Awaited<
  ReturnType<typeof getStudentLeaveRequests>
>["requests"][number];
