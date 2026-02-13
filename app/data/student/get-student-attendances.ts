import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";
import { requireSession } from "@/app/data/session/require-session";
import { redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";
import type { AttendanceSearchParams } from "@/app/(student)/student/subject/[offeringId]/attendance/attendance-search-params";

type StudentAttendancesParams = Pick<
  AttendanceSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "topic"
  | "status"
  | "dateFrom"
  | "dateTo"
> & {
  offeringId: string;
};

function parseDateValue(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Fetch paginated student attendance records with filters.
export async function getStudentAttendances({
  offeringId,
  page,
  pageSize,
  sortBy,
  sortDir,
  topic,
  status,
  dateFrom,
  dateTo,
}: StudentAttendancesParams) {
  const session = await requireSession();
  const can = await requirePermission({
    attendance: ["list"],
  });

  if (!can) {
    redirect("/unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!student) {
    redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedTopic = topic.trim();

  const statusValues = new Set(Object.values(AttendanceStatus));
  const statusFilters = status
    .split(",")
    .map((value) => value.trim())
    .filter((value) => statusValues.has(value as AttendanceStatus));

  const dateFromValue = parseDateValue(dateFrom);
  const dateToValue = parseDateValue(dateTo);

  const dateFilter =
    dateFromValue || dateToValue
      ? {
          date: {
            ...(dateFromValue ? { gte: dateFromValue } : {}),
            ...(dateToValue ? { lte: dateToValue } : {}),
          },
        }
      : {};

  const where: Prisma.StudentAttendanceWhereInput = {
    studentId: student.id,
    ...(statusFilters.length
      ? { status: { in: statusFilters as AttendanceStatus[] } }
      : {}),
    record: {
      offeringId,
      ...(trimmedTopic
        ? { topic: { contains: trimmedTopic, mode: "insensitive" } }
        : {}),
      ...dateFilter,
    },
  };

  const orderBy: Prisma.StudentAttendanceOrderByWithRelationInput =
    sortBy === "date"
      ? { record: { date: direction } }
      : sortBy === "topic"
        ? { record: { topic: direction } }
        : sortBy === "status"
          ? { status: direction }
          : { createdAt: direction };

  const [records, totalCount] = await Promise.all([
    prisma.studentAttendance.findMany({
      where,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      select: {
        id: true,
        status: true,
        record: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
            topic: true,
          },
        },
      },
    }),
    prisma.studentAttendance.count({ where }),
  ]);

  return { records, totalCount };
}

export type StudentGetAttendencesType = Awaited<
  ReturnType<typeof getStudentAttendances>
>["records"][number];
