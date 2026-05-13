import { APP } from "@/lib/data/utils";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const approvedLeaveRequestSortByValues = [
  "studentName",
  "subject",
  "date",
  "createdAt",
] as const;

export const approvedLeaveRequestSortDirValues = ["asc", "desc"] as const;

/// Shared nuqs parsers for approved leave request search params.
export const approvedLeaveRequestSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(approvedLeaveRequestSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(approvedLeaveRequestSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  startDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
  endDate: parseAsIsoDateTime.withOptions({ clearOnDefault: true }),
};

export const approvedLeaveRequestSearchParamsCache = createSearchParamsCache(
  approvedLeaveRequestSearchParamsParsers
);

export type ApprovedLeaveRequestSearchParams = Awaited<
  ReturnType<typeof approvedLeaveRequestSearchParamsCache.parse>
>;
