import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { Role } from "@/lib/generated/prisma/enums";
import { APP } from "@/lib/data/utils";

export const usersSortByValues = [
  "name",
  "email",
  "role",
  "createdAt",
] as const;
export const usersSortDirValues = ["asc", "desc"] as const;
export const usersRoleValues = Object.values(Role);

export type UsersSortBy = (typeof usersSortByValues)[number];
export type UsersSortDir = (typeof usersSortDirValues)[number];
export type UsersRole = (typeof usersRoleValues)[number];

/// Shared nuqs parsers for users search params.
export const usersSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(APP.default_page_size)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(usersSortByValues))
    .withDefault("name")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(usersSortDirValues))
    .withDefault("asc")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  role: parseAsStringEnum(Object.values(usersRoleValues)).withOptions({
    clearOnDefault: true,
  }),
};

export const usersSearchParamsCache = createSearchParamsCache(
  usersSearchParamsParsers
);

export type UsersSearchParams = Awaited<
  ReturnType<typeof usersSearchParamsCache.parse>
>;
