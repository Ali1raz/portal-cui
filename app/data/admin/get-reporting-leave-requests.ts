import "server-only";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import { ReportingLeaveRequestSearchParams } from "@/app/(admin)/admin/reporting/leave-requests/reporting-leave-request-search-params";

export type AdminReportingLeaveRequestsType = Awaited<
  ReturnType<typeof getAdminReportingLeaveRequests>
>["leaveRequests"][number];

export type AdminLeaveRequestSemesterOption = Awaited<
  ReturnType<typeof getAdminReportingLeaveRequestSemesters>
>[number];

/// Fetch paginated leave requests for the admin reporting view.
export async function getAdminReportingLeaveRequests({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  studentName,
  requestNo,
  semesterId,
  status,
  startDate,
  endDate,
}: ReportingLeaveRequestSearchParams) {
  await requireSession();

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
  const trimmedStudentName = studentName.trim();
  const trimmedRequestNo = requestNo.trim();

  const andConditions: Prisma.LeaveRequestWhereInput[] = [];

  if (trimmedQuery) {
    andConditions.push({
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
    });
  }

  if (trimmedStudentName) {
    andConditions.push({
      student: {
        user: {
          name: { contains: trimmedStudentName, mode: "insensitive" },
        },
      },
    });
  }

  if (trimmedRequestNo) {
    andConditions.push({
      id: { contains: trimmedRequestNo, mode: "insensitive" },
    });
  }

  if (semesterId) {
    andConditions.push({
      offering: {
        semesterId,
      },
    });
  }

  if (status && status !== "all") {
    andConditions.push({
      status: status as LeaveStatus,
    });
  }

  if (startDate || endDate) {
    andConditions.push({
      date: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      },
    });
  }

  const where: Prisma.LeaveRequestWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.LeaveRequestOrderByWithRelationInput =
    sortBy === "studentName"
      ? { student: { user: { name: direction } } }
      : sortBy === "department"
        ? { offering: { department: direction } }
        : sortBy === "subject"
          ? { offering: { subject: { name: direction } } }
          : sortBy === "date"
            ? { date: direction }
            : sortBy === "status"
              ? { status: direction }
              : sortBy === "reasonTitle"
                ? { reasonTitle: direction }
                : { createdAt: direction };

  const [leaveRequests, totalCount] = await Promise.all([
    prisma.leaveRequest.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      where,
      orderBy,
      select: {
        id: true,
        date: true,
        reasonTitle: true,
        status: true,
        createdAt: true,
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
        offering: {
          select: {
            department: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            semester: {
              select: {
                id: true,
                semester: true,
                year: true,
                batch: true,
                program: true,
                department: true,
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

/// Fetch semester options used by the admin reporting filters.
export async function getAdminReportingLeaveRequestSemesters() {
  await requireSession();

  const can = await requirePermission({
    leaveRequest: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  return prisma.semester.findMany({
    orderBy: [{ year: "desc" }, { semester: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      semester: true,
      year: true,
      batch: true,
      program: true,
      department: true,
    },
  });
}
