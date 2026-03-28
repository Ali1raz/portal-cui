import { APP } from "@/lib/data/utils";
import { Batch, Department } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const semesterSortByValues = [
  "semester",
  "year",
  "department",
  "batch",
  "isActive",
  "startDate",
  "registrationStart",
  "enrollmentStart",
  "offerings",
  "registrations",
  "createdAt",
] as const;

export const semesterSortDirValues = ["asc", "desc"] as const;
export const semesterDepartmentValues = [...Object.values(Department)] as const;
export const semesterBatchValues = [...Object.values(Batch)] as const;
export const semesterStatusValues = ["all", "active", "inactive"] as const;

export type SemesterSortBy = (typeof semesterSortByValues)[number];
export type SemesterSortDir = (typeof semesterSortDirValues)[number];
export type SemesterDepartment = (typeof semesterDepartmentValues)[number];
export type SemesterBatch = (typeof semesterBatchValues)[number];
export type SemesterStatus = (typeof semesterStatusValues)[number];

/// Shared nuqs parsers for semester search params.
export const semesterSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(semesterSortByValues))
    .withDefault("year")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(semesterSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  department: parseAsStringEnum(
    Object.values(semesterDepartmentValues)
  ).withOptions({
    clearOnDefault: true,
  }),
  batch: parseAsStringEnum(Object.values(semesterBatchValues)).withOptions({
    clearOnDefault: true,
  }),
  status: parseAsStringEnum(Object.values(semesterStatusValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  year: parseAsInteger.withOptions({ clearOnDefault: true }),
  semester: parseAsInteger.withOptions({ clearOnDefault: true }),
};

export const semesterSearchParamsCache = createSearchParamsCache(
  semesterSearchParamsParsers
);

export type SemesterSearchParams = Awaited<
  ReturnType<typeof semesterSearchParamsCache.parse>
>;
