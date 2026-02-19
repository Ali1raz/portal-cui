import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  AnnouncementStatus,
  AnnouncementType,
} from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import type { HodAnnouncementsSearchParams } from "@/app/(HOD)/hod/announcements/announcements-search-params";

const statusValues = new Set(Object.values(AnnouncementStatus));
const typeValues = new Set(Object.values(AnnouncementType));

type HodAnnouncementsParams = Pick<
  HodAnnouncementsSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "status"
  | "type"
  | "dateFrom"
  | "dateTo"
  | "pinned"
  | "hasAttachment"
  | "query"
>;

function parseDateValue(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Fetch paginated HOD announcements with filters and sorting.
export async function hodGetAnnouncements({
  page,
  pageSize,
  sortBy,
  sortDir,
  status,
  type,
  dateFrom,
  dateTo,
  pinned,
  hasAttachment,
  query,
}: HodAnnouncementsParams) {
  const session = await requireSession();
  const hod = await prisma.hod.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      department: true,
    },
  });

  const can = await requirePermission({
    announcements: ["list"],
  });

  if (!can || !hod) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;

  const statusFilters = status
    .split(",")
    .map((value) => value.trim())
    .filter((value) => statusValues.has(value as AnnouncementStatus));

  const typeFilters = type
    .split(",")
    .map((value) => value.trim())
    .filter((value) => typeValues.has(value as AnnouncementType));

  const from = parseDateValue(dateFrom);
  const to = parseDateValue(dateTo);

  const where: Prisma.AnnouncementWhereInput = {
    targetDepartment: hod.department,
    ...(statusFilters.length > 0 && {
      status: { in: statusFilters as AnnouncementStatus[] },
    }),
    ...(typeFilters.length > 0 && {
      type: { in: typeFilters as AnnouncementType[] },
    }),
    ...(from && {
      createdAt: { gte: from },
    }),
    ...(to && {
      createdAt: { lte: to },
    }),
    ...(pinned === "pinned" && { isPinned: true }),
    ...(pinned === "unpinned" && { isPinned: false }),
    ...(hasAttachment === "with" && {
      AND: [{ imageKey: { not: null } }, { imageKey: { not: "" } }],
    }),
    ...(hasAttachment === "without" && {
      OR: [{ imageKey: null }, { imageKey: "" }],
    }),
    ...(query &&
      query.trim().length > 0 && {
        OR: [
          { title: { contains: query.trim(), mode: "insensitive" } },
          { content: { contains: query.trim(), mode: "insensitive" } },
        ],
      }),
  };

  const orderBy: Prisma.AnnouncementOrderByWithRelationInput = {
    [sortBy]: direction,
  };

  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        status: true,
        scheduledFor: true,
        publishedAt: true,
        imageKey: true,
        isPinned: true,
        createdAt: true,
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    announcements,
    totalCount,
  };
}

/// Row type for HOD announcements table.
export type HodAnnouncementRow = Awaited<
  ReturnType<typeof hodGetAnnouncements>
>["announcements"][number];
