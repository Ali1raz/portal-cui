import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const leaveRequestsSortByValues = [
  "student",
  "registrationNo",
  "title",
  "date",
  "createdAt",
  "status",
] as const;

export const leaveRequestsSortDirValues = ["asc", "desc"] as const;

export type LeaveRequestsSortBy = (typeof leaveRequestsSortByValues)[number];
export type LeaveRequestsSortDir = (typeof leaveRequestsSortDirValues)[number];

/// Shared nuqs parsers for professor leave requests search params.
export const leaveRequestsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger.withDefault(10).withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsStringEnum(Object.values(leaveRequestsSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(leaveRequestsSortDirValues))
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
  createdFrom: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  createdTo: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
};

export const leaveRequestsSearchParamsCache = createSearchParamsCache(
  leaveRequestsSearchParamsParsers
);

export type LeaveRequestsSearchParams = Awaited<
  ReturnType<typeof leaveRequestsSearchParamsCache.parse>
>;
