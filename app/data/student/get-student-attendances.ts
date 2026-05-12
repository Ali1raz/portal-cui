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

  const enrolledOffering = await prisma.subjectOffering.findFirst({
    where: {
      id: offeringId,
      enrollments: { some: { studentId: student.id } },
    },
    select: { id: true },
  });

  if (!enrolledOffering) {
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
    .filter((value) =>
      statusValues.has(value as AttendanceStatus)
    ) as AttendanceStatus[];

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

  const recordOrderBy: Prisma.AttendanceRecordOrderByWithRelationInput =
    sortBy === "topic"
      ? { topic: direction }
      : sortBy === "createdAt"
        ? { createdAt: direction }
        : { date: direction };

  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: {
      offeringId,
      ...(trimmedTopic
        ? { topic: { contains: trimmedTopic, mode: "insensitive" } }
        : {}),
      ...dateFilter,
    },
    include: {
      attendances: {
        where: { studentId: student.id },
        select: { status: true },
      },
    },
    orderBy: sortBy === "status" ? [{ date: "desc" }] : recordOrderBy,
  });

  const normalizedRecords = attendanceRecords.map((record) => ({
    id: record.id,
    status: record.attendances[0]?.status ?? AttendanceStatus.ABSENT,
    record: {
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      topic: record.topic,
    },
  }));

  const filteredRecords = statusFilters.length
    ? normalizedRecords.filter((record) =>
        statusFilters.includes(record.status)
      )
    : normalizedRecords;

  const sortedRecords =
    sortBy === "status"
      ? filteredRecords.slice().sort((a, b) => {
          const compare = a.status.localeCompare(b.status);
          if (compare !== 0) {
            return sortDir === "asc" ? compare : -compare;
          }
          return sortDir === "asc"
            ? a.record.date.getTime() - b.record.date.getTime()
            : b.record.date.getTime() - a.record.date.getTime();
        })
      : filteredRecords;

  const totalCount = sortedRecords.length;
  const records = sortedRecords.slice(
    (safePage - 1) * safePageSize,
    safePage * safePageSize
  );

  return { records, totalCount };
}

export type StudentGetAttendencesType = Awaited<
  ReturnType<typeof getStudentAttendances>
>["records"][number];
