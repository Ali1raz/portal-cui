import { APP } from "@/lib/data/utils";
import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const feeSortByValues = [
  "totalAmount",
  "status",
  "semester",
  "createdAt",
] as const;

export const feeSortDirValues = ["asc", "desc"] as const;

export const feeStatusValues = [
  "all",
  ...Object.values(SemesterFeeStatus),
] as const;

export type FeeSortBy = (typeof feeSortByValues)[number];
export type FeeSortDir = (typeof feeSortDirValues)[number];
export type FeeStatus = (typeof feeStatusValues)[number];

/// Shared nuqs parsers for fee search params.
export const feeSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(feeSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(feeSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(Object.values(feeStatusValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  semesterId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
};

export const feeSearchParamsCache = createSearchParamsCache(
  feeSearchParamsParsers
);

export type FeeSearchParams = Awaited<
  ReturnType<typeof feeSearchParamsCache.parse>
>;
