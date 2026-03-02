import { APP } from "@/lib/data/utils";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const leaveRequestSortByValues = [
  "studentName",
  "subject",
  "date",
  "createdAt",
  "status",
] as const;

export const leaveRequestSortDirValues = ["asc", "desc"] as const;

export const leaveRequestStatusValues = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type LeaveRequestSortBy = (typeof leaveRequestSortByValues)[number];
export type LeaveRequestSortDir = (typeof leaveRequestSortDirValues)[number];
export type LeaveRequestStatus = (typeof leaveRequestStatusValues)[number];

/// Shared nuqs parsers for leave request search params.
export const leaveRequestSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(leaveRequestSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(leaveRequestSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(
    Object.values(leaveRequestStatusValues)
  ).withOptions({
    clearOnDefault: true,
  }),
  startDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
  endDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
};

export const leaveRequestSearchParamsCache = createSearchParamsCache(
  leaveRequestSearchParamsParsers
);

export type LeaveRequestSearchParams = Awaited<
  ReturnType<typeof leaveRequestSearchParamsCache.parse>
>;
