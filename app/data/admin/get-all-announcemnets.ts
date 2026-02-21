import "server-only";

import { redirect } from "next/navigation";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  AnnouncementStatus,
  AnnouncementType,
  Batch,
  Department,
  Program,
} from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import type { AdminAnnouncementsSearchParams } from "@/app/(admin)/admin/announcements/announcement-search-params";

const statusValues = new Set(Object.values(AnnouncementStatus));
const typeValues = new Set(Object.values(AnnouncementType));
const departmentValues = new Set(Object.values(Department));
const programValues = new Set(Object.values(Program));
const batchValues = new Set(Object.values(Batch));

type AdminAnnouncementsParams = Pick<
  AdminAnnouncementsSearchParams,
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
  | "department"
  | "program"
  | "batch"
>;

function parseDateValue(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Fetch paginated admin announcements with filters and sorting.
export async function adminGetAllAnnouncements({
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
  department,
  program,
  batch,
}: AdminAnnouncementsParams) {
  const session = await requireSession();

  const can = await requirePermission({
    announcements: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  const statusFilters = status
    .split(",")
    .map((value) => value.trim())
    .filter((value) => statusValues.has(value as AnnouncementStatus));

  const typeFilters = type
    .split(",")
    .map((value) => value.trim())
    .filter((value) => typeValues.has(value as AnnouncementType));

  const departmentFilters = department
    .split(",")
    .map((value) => value.trim())
    .filter((value) => departmentValues.has(value as Department));

  const programFilters = program
    .split(",")
    .map((value) => value.trim())
    .filter((value) => programValues.has(value as Program));

  const batchFilters = batch
    .split(",")
    .map((value) => value.trim())
    .filter((value) => batchValues.has(value as Batch));

  const from = parseDateValue(dateFrom);
  const to = parseDateValue(dateTo);

  const where: Prisma.AnnouncementWhereInput = {
    // Only get announcements created by current user
    authorId: session.user.id,
    ...(trimmedQuery && {
      OR: [
        { title: { contains: trimmedQuery, mode: "insensitive" } },
        { content: { contains: trimmedQuery, mode: "insensitive" } },
        {
          author: {
            name: { contains: trimmedQuery, mode: "insensitive" },
          },
        },
      ],
    }),
    ...(statusFilters.length > 0 && {
      status: { in: statusFilters as AnnouncementStatus[] },
    }),
    ...(typeFilters.length > 0 && {
      type: { in: typeFilters as AnnouncementType[] },
    }),
    ...(departmentFilters.length > 0 && {
      targetDepartment: { in: departmentFilters as Department[] },
    }),
    ...(programFilters.length > 0 && {
      targetProgram: { in: programFilters as Program[] },
    }),
    ...(batchFilters.length > 0 && {
      targetBatch: { in: batchFilters as Batch[] },
    }),
    ...(from && {
      createdAt: { gte: from },
    }),
    ...(to && {
      createdAt: { lte: to },
    }),
    ...(pinned === "pinned" && { isPinned: true }),
    ...(pinned === "unpinned" && { isPinned: false }),
    ...(hasAttachment === "with" && { imageKey: { not: null } }),
    ...(hasAttachment === "without" && {
      OR: [{ imageKey: null }, { imageKey: "" }],
    }),
  };

  const orderBy: Prisma.AnnouncementOrderByWithRelationInput =
    sortBy === "createdAt"
      ? { createdAt: direction }
      : sortBy === "title"
        ? { title: direction }
        : sortBy === "type"
          ? { type: direction }
          : sortBy === "status"
            ? { status: direction }
            : sortBy === "scheduledFor"
              ? { scheduledFor: direction }
              : sortBy === "isPinned"
                ? { isPinned: direction }
                : sortBy === "author"
                  ? { author: { name: direction } }
                  : { createdAt: "desc" };

  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        status: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        scheduledFor: true,
        publishedAt: true,
        targetDepartment: true,
        targetProgram: true,
        targetBatch: true,
        targetYear: true,
        isPinned: true,
        imageKey: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return { announcements, totalCount };
}

export type AdminAnnouncementRow = Awaited<
  ReturnType<typeof adminGetAllAnnouncements>
>["announcements"][number];
