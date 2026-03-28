import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import {
  Department,
  StudentApplicationStatus,
} from "@/lib/generated/prisma/enums";
import { APP } from "@/lib/data/utils";

export const clerkApplicationsSortByValues = [
  "submittedAt",
  "preferredDepartment",
  "status",
  "fullName",
] as const;

export const clerkApplicationsSortDirValues = ["asc", "desc"] as const;
export const clerkApplicationsStatusValues = Object.values(
  StudentApplicationStatus
);

export type ClerkApplicationsSortBy =
  (typeof clerkApplicationsSortByValues)[number];
export type ClerkApplicationsSortDir =
  (typeof clerkApplicationsSortDirValues)[number];
export type ClerkApplicationsStatus =
  (typeof clerkApplicationsStatusValues)[number];

export const clerkApplicationsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(clerkApplicationsSortByValues))
    .withDefault("submittedAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(clerkApplicationsSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(
    Object.values(clerkApplicationsStatusValues)
  ).withOptions({ clearOnDefault: true }),
  department: parseAsStringEnum(Object.values(Department)).withOptions({
    clearOnDefault: true,
  }),
  submittedFrom: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  submittedTo: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
};

export const clerkApplicationsSearchParamsCache = createSearchParamsCache(
  clerkApplicationsSearchParamsParsers
);

export type ClerkApplicationsSearchParams = Awaited<
  ReturnType<typeof clerkApplicationsSearchParamsCache.parse>
>;
