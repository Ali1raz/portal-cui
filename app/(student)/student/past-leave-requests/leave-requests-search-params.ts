import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { APP } from "@/lib/data/utils";

export const leaveRequestsSortByValues = [
  "subject",
  "title",
  "date",
  "createdAt",
  "status",
] as const;

export const leaveRequestsSortDirValues = ["asc", "desc"] as const;
export const leaveRequestsStatusValues = Object.values(LeaveStatus);

export type StudentLeaveRequestsSortBy =
  (typeof leaveRequestsSortByValues)[number];
export type StudentLeaveRequestsSortDir =
  (typeof leaveRequestsSortDirValues)[number];
export type StudentLeaveRequestsStatus =
  (typeof leaveRequestsStatusValues)[number];

/// Shared nuqs parsers for student leave requests search params.
export const leaveRequestsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger.withDefault(APP.default_page_size).withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsStringEnum(Object.values(leaveRequestsSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(leaveRequestsSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const leaveRequestsSearchParamsCache = createSearchParamsCache(
  leaveRequestsSearchParamsParsers
);

export type StudentLeaveRequestsSearchParams = Awaited<
  ReturnType<typeof leaveRequestsSearchParamsCache.parse>
>;
