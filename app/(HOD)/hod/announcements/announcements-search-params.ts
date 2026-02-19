import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const announcementSortByValues = [
  "createdAt",
  "title",
  "type",
  "status",
  "scheduledFor",
  "isPinned",
] as const;

export const announcementSortDirValues = ["asc", "desc"] as const;

export const announcementPinnedValues = ["all", "pinned", "unpinned"] as const;

export const announcementAttachmentValues = ["all", "with", "without"] as const;

export type AnnouncementSortBy = (typeof announcementSortByValues)[number];
export type AnnouncementSortDir = (typeof announcementSortDirValues)[number];
export type AnnouncementPinnedFilter =
  (typeof announcementPinnedValues)[number];
export type AnnouncementAttachmentFilter =
  (typeof announcementAttachmentValues)[number];

/// URL search param parsers for HOD announcements.
export const hodAnnouncementsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  sortBy: parseAsStringEnum(
    Object.values(announcementSortByValues)
  ).withDefault("createdAt"),
  sortDir: parseAsStringEnum(
    Object.values(announcementSortDirValues)
  ).withDefault("desc"),
  status: parseAsString.withDefault(""),
  type: parseAsString.withDefault(""),
  dateFrom: parseAsString.withDefault(""),
  dateTo: parseAsString.withDefault(""),
  pinned: parseAsStringEnum(
    Object.values(announcementPinnedValues)
  ).withDefault("all"),
  hasAttachment: parseAsStringEnum(
    Object.values(announcementAttachmentValues)
  ).withDefault("all"),
  query: parseAsString.withDefault(""),
};

/// Server-side cache for parsed HOD announcement search params.
export const hodAnnouncementsSearchParamsCache = createSearchParamsCache(
  hodAnnouncementsSearchParamsParsers
);

export type HodAnnouncementsSearchParams = Awaited<
  ReturnType<typeof hodAnnouncementsSearchParamsCache.parse>
>;
