import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

/// Available sort fields for at-risk students table.
export const atRiskStudentsSortByValues = [
  "student",
  "subject",
  "effectivePct",
  "rawPct",
  "total",
  "present",
  "leave",
  "absent",
] as const;

export type AtRiskStudentsSortBy = (typeof atRiskStudentsSortByValues)[number];

/// Available sort directions for at-risk students table.
export const sortDirectionValues = ["asc", "desc"] as const;

export type SortDirection = (typeof sortDirectionValues)[number];

/// URL search parameters parsers for at-risk students list.
export const atRiskStudentsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sortBy: parseAsStringEnum(
    Object.values(atRiskStudentsSortByValues)
  ).withDefault("effectivePct"),
  sortDir: parseAsStringEnum(Object.values(sortDirectionValues)).withDefault(
    "asc"
  ),
  query: parseAsString.withDefault(""),
};

/// Server-side search params cache for at-risk students.
export const atRiskStudentsSearchParamsCache = createSearchParamsCache(
  atRiskStudentsSearchParamsParsers
);

/// Type for parsed search parameters.
export type AtRiskStudentsSearchParams = Awaited<
  ReturnType<typeof atRiskStudentsSearchParamsCache.parse>
>;
