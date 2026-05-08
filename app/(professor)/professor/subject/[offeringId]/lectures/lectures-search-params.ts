import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { APP } from "@/lib/data/utils";

export const lecturesSortByValues = ["date", "topic", "createdAt"] as const;
export const lecturesSortDirValues = ["asc", "desc"] as const;

export type LecturesSortBy = (typeof lecturesSortByValues)[number];
export type LecturesSortDir = (typeof lecturesSortDirValues)[number];

/// Shared nuqs parsers for lectures search params.
export const lecturesSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger.withDefault(APP.default_page_size).withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsString.withDefault("date").withOptions({
    clearOnDefault: true,
  }),
  sortDir: parseAsString.withDefault("desc").withOptions({
    clearOnDefault: true,
  }),
  topic: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const lecturesSearchParamsCache = createSearchParamsCache(
  lecturesSearchParamsParsers
);

export type LecturesSearchParams = Awaited<
  ReturnType<typeof lecturesSearchParamsCache.parse>
>;
