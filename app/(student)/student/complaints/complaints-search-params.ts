import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import {
  ComplaintCategory,
  ComplaintStatus,
} from "@/lib/generated/prisma/enums";
import { APP } from "@/lib/data/utils";

export const complaintsSortByValues = [
  "title",
  "category",
  "status",
  "createdAt",
] as const;

export const complaintsSortDirValues = ["asc", "desc"] as const;
export const complaintStatusValues = Object.values(ComplaintStatus);
export const complaintCategoryValues = Object.values(ComplaintCategory);
export const complaintAttachmentValues = ["with", "without"] as const;

export type ComplaintsSortBy = (typeof complaintsSortByValues)[number];
export type ComplaintsSortDir = (typeof complaintsSortDirValues)[number];
export type ComplaintAttachmentFilter =
  (typeof complaintAttachmentValues)[number];

/// Shared nuqs parsers for complaints search params.
export const complaintsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger.withDefault(APP.default_page_size).withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsStringEnum(Object.values(complaintsSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(complaintsSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  category: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateFrom: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  dateTo: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  hasAttachment: parseAsStringEnum(
    Object.values(complaintAttachmentValues)
  ).withOptions({ clearOnDefault: true }),
};

export const complaintsSearchParamsCache = createSearchParamsCache(
  complaintsSearchParamsParsers
);

export type ComplaintsSearchParams = Awaited<
  ReturnType<typeof complaintsSearchParamsCache.parse>
>;
