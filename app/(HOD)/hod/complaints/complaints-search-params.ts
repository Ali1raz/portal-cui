import { APP } from "@/lib/data/utils";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

/// Available sort fields for HOD complaints table.
export const hodComplaintsSortByValues = [
  "title",
  "category",
  "status",
  "createdAt",
  "studentName",
] as const;

export type HodComplaintsSortBy = (typeof hodComplaintsSortByValues)[number];

/// Available sort directions for HOD complaints table.
export const sortDirectionValues = ["asc", "desc"] as const;

export type SortDirection = (typeof sortDirectionValues)[number];

/// Available attachment filter values.
export const complaintAttachmentValues = ["all", "with", "without"] as const;

export type ComplaintAttachmentFilter =
  (typeof complaintAttachmentValues)[number];

/// URL search parameters parsers for HOD complaints list.
export const hodComplaintsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(APP.default_page_size),
  sortBy: parseAsStringEnum(
    Object.values(hodComplaintsSortByValues)
  ).withDefault("createdAt"),
  sortDir: parseAsStringEnum(Object.values(sortDirectionValues)).withDefault(
    "desc"
  ),
  status: parseAsString.withDefault(""),
  category: parseAsString.withDefault(""),
  dateFrom: parseAsString.withDefault(""),
  dateTo: parseAsString.withDefault(""),
  hasAttachment: parseAsStringEnum(
    Object.values(complaintAttachmentValues)
  ).withDefault("all"),
  query: parseAsString.withDefault(""),
};

/// Server-side search params cache for HOD complaints.
export const hodComplaintsSearchParamsCache = createSearchParamsCache(
  hodComplaintsSearchParamsParsers
);

/// Type for parsed search parameters.
export type HodComplaintsSearchParams = Awaited<
  ReturnType<typeof hodComplaintsSearchParamsCache.parse>
>;
