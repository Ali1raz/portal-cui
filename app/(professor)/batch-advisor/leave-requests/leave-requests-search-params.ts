import { APP } from "@/lib/data/utils";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const baLeaveRequestsSortByValues = [
  "studentName",
  "reasonTitle",
  "date",
  "createdAt",
  "status",
] as const;

export const baLeaveRequestsSortDirValues = ["asc", "desc"] as const;

export const baLeaveRequestStatusValues: LeaveStatus[] = [
  "PENDING",
  "REVIEW_REQUESTED",
  "HOD_PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type BaLeaveRequestsSortBy =
  (typeof baLeaveRequestsSortByValues)[number];

/// URL search params parsers for Batch Advisor leave requests list.
export const baLeaveRequestsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum([...baLeaveRequestsSortByValues])
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum([...baLeaveRequestsSortDirValues])
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateFrom: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  dateTo: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
};

export const baLeaveRequestsSearchParamsCache = createSearchParamsCache(
  baLeaveRequestsSearchParamsParsers
);

export type BaLeaveRequestsSearchParams = Awaited<
  ReturnType<typeof baLeaveRequestsSearchParamsCache.parse>
>;
