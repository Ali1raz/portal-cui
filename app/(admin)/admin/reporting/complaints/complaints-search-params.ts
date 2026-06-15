import { APP } from "@/lib/data/utils";
import { Department } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const complaintAttachmentValues = ["all", "with", "without"] as const;

export const reportingComplaintsSortByValues = [
  "title",
  "category",
  "status",
  "createdAt",
  "studentName",
  "department",
] as const;

export type ReportingComplaintsSortBy =
  (typeof reportingComplaintsSortByValues)[number];

export const sortDirectionValues = ["asc", "desc"] as const;

export type SortDirection = (typeof sortDirectionValues)[number];

export type ComplaintAttachmentFilter =
  (typeof complaintAttachmentValues)[number];

export const reportingComplaintsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(reportingComplaintsSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(sortDirectionValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  status: parseAsString
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  category: parseAsString
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  department: parseAsStringEnum(["all", ...Object.values(Department)])
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  dateFrom: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateTo: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  hasAttachment: parseAsStringEnum(Object.values(complaintAttachmentValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const reportingComplaintsSearchParamsCache = createSearchParamsCache(
  reportingComplaintsSearchParamsParsers
);

export type ReportingComplaintsSearchParams = Awaited<
  ReturnType<typeof reportingComplaintsSearchParamsCache.parse>
>;
