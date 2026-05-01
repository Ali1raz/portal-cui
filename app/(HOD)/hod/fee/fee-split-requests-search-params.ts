import { APP } from "@/lib/data/utils";
import { SplitRequestStatus } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const hodFeeSplitSortByValues = [
  "createdAt",
  "preferredDueDate",
  "requestedAmount",
  "status",
  "studentName",
  "registrationNo",
  "semester",
] as const;

export const sortDirectionValues = ["asc", "desc"] as const;

export const feeSplitStatusValues = [
  "all",
  ...Object.values(SplitRequestStatus),
] as const;

export type HodFeeSplitSortBy = (typeof hodFeeSplitSortByValues)[number];
export type SortDirection = (typeof sortDirectionValues)[number];
export type FeeSplitStatusFilter = (typeof feeSplitStatusValues)[number];

export const hodFeeSplitSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(APP.default_page_size),
  sortBy: parseAsStringEnum(Object.values(hodFeeSplitSortByValues)).withDefault(
    "createdAt"
  ),
  sortDir: parseAsStringEnum(Object.values(sortDirectionValues)).withDefault(
    "desc"
  ),
  status: parseAsStringEnum(Object.values(feeSplitStatusValues)).withDefault(
    "all"
  ),
  semesterId: parseAsString.withDefault(""),
  query: parseAsString.withDefault(""),
};

export const hodFeeSplitSearchParamsCache = createSearchParamsCache(
  hodFeeSplitSearchParamsParsers
);

export type HodFeeSplitSearchParams = Awaited<
  ReturnType<typeof hodFeeSplitSearchParamsCache.parse>
>;
