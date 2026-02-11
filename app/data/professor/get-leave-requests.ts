import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import type { LeaveRequestsSearchParams } from "@/app/(professor)/professor/subject/[offeringId]/leave-requests/leave-requests-search-params";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

type ProfessorGetLeaveRequestsParams = Pick<
  LeaveRequestsSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "query"
  | "status"
  | "dateFrom"
  | "dateTo"
  | "createdFrom"
  | "createdTo"
> & {
  offeringId: string;
};

/// Fetches professor leave requests using search filters and pagination.
export async function professorGetLeaveRequests({
  offeringId,
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  status,
  dateFrom,
  dateTo,
  createdFrom,
  createdTo,
}: ProfessorGetLeaveRequestsParams) {
  const session = await requireSession();

  const can = await requirePermission({
    leaveRequest: ["list"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

  const prof = await prisma.professor.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!prof) {
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
  const createdFromValue = parseDate(createdFrom);
  const createdToValue = parseDate(createdTo);

  const where: Prisma.LeaveRequestWhereInput = {
    offeringId,
    offering: {
      teachingAssignments: {
        some: {
          professorId: prof.id,
        },
      },
    },
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
    ...(createdFromValue || createdToValue
      ? {
          createdAt: {
            ...(createdFromValue ? { gte: createdFromValue } : {}),
            ...(createdToValue ? { lte: createdToValue } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.LeaveRequestOrderByWithRelationInput =
    sortBy === "student"
      ? { student: { user: { name: direction } } }
      : sortBy === "registrationNo"
        ? { student: { registrationNo: direction } }
        : sortBy === "title"
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
        date: true,
        reasonTitle: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            department: true,
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

  return { leaveRequests, totalCount };
}

export type ProfessorGetLeaveRequests = Awaited<
  ReturnType<typeof professorGetLeaveRequests>
>["leaveRequests"][number];
