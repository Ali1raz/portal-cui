import { APP } from "@/lib/data/utils";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

/// Available sort fields for BA complaints table.
export const baComplaintsSortByValues = [
  "title",
  "category",
  "status",
  "createdAt",
  "studentName",
] as const;

export type BaComplaintsSortBy = (typeof baComplaintsSortByValues)[number];

/// Available sort directions for BA complaints table.
export const sortDirectionValues = ["asc", "desc"] as const;
export type SortDirection = (typeof sortDirectionValues)[number];

/// Available attachment filter values.
export const complaintAttachmentValues = ["all", "with", "without"] as const;
export type ComplaintAttachmentFilter =
  (typeof complaintAttachmentValues)[number];

/// URL search parameters parsers for BA complaints list.
export const baComplaintsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum([...baComplaintsSortByValues])
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum([...sortDirectionValues])
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  category: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateFrom: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateTo: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  hasAttachment: parseAsStringEnum([...complaintAttachmentValues])
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

/// Server-side search params cache for BA complaints.
export const baComplaintsSearchParamsCache = createSearchParamsCache(
  baComplaintsSearchParamsParsers
);

/// Type for parsed search parameters.
export type BaComplaintsSearchParams = Awaited<
  ReturnType<typeof baComplaintsSearchParamsCache.parse>
>;
