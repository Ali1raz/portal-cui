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
  "author",
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

/// URL search param parsers for admin announcements.
export const adminAnnouncementsSearchParamsParsers = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(10)
    .withOptions({ clearOnDefault: true }),
  sortBy: parseAsStringEnum(Object.values(announcementSortByValues))
    .withDefault("createdAt")
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringEnum(Object.values(announcementSortDirValues))
    .withDefault("desc")
    .withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  type: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateFrom: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  dateTo: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  pinned: parseAsStringEnum(Object.values(announcementPinnedValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  hasAttachment: parseAsStringEnum(Object.values(announcementAttachmentValues))
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  query: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  department: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  program: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  batch: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

/// Server-side cache for parsed admin announcement search params.
export const adminAnnouncementsSearchParamsCache = createSearchParamsCache(
  adminAnnouncementsSearchParamsParsers
);

export type AdminAnnouncementsSearchParams = Awaited<
  ReturnType<typeof adminAnnouncementsSearchParamsCache.parse>
>;
