import { APP } from "@/lib/data/utils";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
export const subjectsSortByValues = [
  "name",
  "code",
  "creditHours",
  "offerings",
] as const;
export const sortDirValues = ["asc", "desc"] as const;

export type SubjectsSortBy = (typeof subjectsSortByValues)[number];
export type SubjectsSortDir = (typeof sortDirValues)[number];

/// Shared nuqs parsers for subjects search params.
export const subjectsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(subjectsSortByValues))
    .withDefault("name")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(sortDirValues))
    .withDefault("asc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const subjectsSearchParamsCache = createSearchParamsCache(
  subjectsSearchParamsParsers
);

export type SubjectsSearchParams = Awaited<
  ReturnType<typeof subjectsSearchParamsCache.parse>
>;
