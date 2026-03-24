import { APP } from "@/lib/data/utils";
import { Batch, Department } from "@/lib/generated/prisma/enums";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const offeringSortByValues = [
  "semester",
  "year",
  "department",
  "subject",
  "totalLectures",
  "enrollments",
  "teachings",
] as const;

export const offeringSortDirValues = ["asc", "desc"] as const;

export const offeringDepartmentValues = [...Object.values(Department)] as const;

export const offeringBatchValues = [...Object.values(Batch)] as const;

export const hasTeacherValues = ["all", "yes", "no"] as const;
export const hasEnrollmentsValues = ["all", "yes", "no"] as const;

export type OfferingSortBy = (typeof offeringSortByValues)[number];
export type OfferingSortDir = (typeof offeringSortDirValues)[number];
export type OfferingDepartment = (typeof offeringDepartmentValues)[number];
export type OfferingBatch = (typeof offeringBatchValues)[number];
export type HasTeacher = (typeof hasTeacherValues)[number];
export type HasEnrollments = (typeof hasEnrollmentsValues)[number];

/// Shared nuqs parsers for offering search params.
export const offeringSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(offeringSortByValues))
    .withDefault("semester")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(offeringSortDirValues))
    .withDefault("asc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  department: parseAsStringEnum(
    Object.values(offeringDepartmentValues)
  ).withOptions({
    clearOnDefault: true,
  }),
  batch: parseAsStringEnum(Object.values(offeringBatchValues)).withOptions({
    clearOnDefault: true,
  }),
  semesterId: parseAsString.withOptions({ clearOnDefault: true }),
  semester: parseAsInteger.withOptions({ clearOnDefault: true }),
  year: parseAsInteger.withOptions({ clearOnDefault: true }),
  hasTeacher: parseAsStringEnum(Object.values(hasTeacherValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  hasEnrollments: parseAsStringEnum(Object.values(hasEnrollmentsValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
};

export const offeringSearchParamsCache = createSearchParamsCache(
  offeringSearchParamsParsers
);

export type OfferingSearchParams = Awaited<
  ReturnType<typeof offeringSearchParamsCache.parse>
>;
