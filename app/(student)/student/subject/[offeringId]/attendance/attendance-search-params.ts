import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";

export const attendanceSortByValues = [
  "date",
  "topic",
  "status",
  "createdAt",
] as const;

export const attendanceSortDirValues = ["asc", "desc"] as const;
export const attendanceStatusValues = Object.values(AttendanceStatus);

export type AttendanceSortBy = (typeof attendanceSortByValues)[number];
export type AttendanceSortDir = (typeof attendanceSortDirValues)[number];
export type AttendanceStatusFilter = (typeof attendanceStatusValues)[number];

/// Shared nuqs parsers for attendance search params.
export const attendanceSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger.withDefault(10).withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsStringEnum(Object.values(attendanceSortByValues))
    .withDefault("date")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(attendanceSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  topic: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateFrom: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  dateTo: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
};

export const attendanceSearchParamsCache = createSearchParamsCache(
  attendanceSearchParamsParsers
);

export type AttendanceSearchParams = Awaited<
  ReturnType<typeof attendanceSearchParamsCache.parse>
>;
