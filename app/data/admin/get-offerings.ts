import prisma from "@/lib/prisma";
import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { OfferingSearchParams } from "@/app/(admin)/admin/offering/offering-search-params";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

type AdminGetOfferingsParams = Pick<
  OfferingSearchParams,
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortDir"
  | "query"
  | "department"
  | "semester"
  | "year"
>;

export async function getAdminOfferings({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  department,
  semester,
  year,
}: AdminGetOfferingsParams) {
  const can = await requirePermission({
    subjectOfferings: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();
  const where: Prisma.SubjectOfferingWhereInput = {
    ...(trimmedQuery
      ? {
          OR: [
            {
              subject: {
                name: { contains: trimmedQuery, mode: "insensitive" },
              },
            },
            {
              subject: {
                code: { contains: trimmedQuery, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
    ...(department ? { department } : {}),
    ...(typeof semester === "number" ? { semester } : {}),
    ...(typeof year === "number" ? { year } : {}),
  };

  const orderBy: Prisma.SubjectOfferingOrderByWithRelationInput =
    sortBy === "semester"
      ? { semester: direction }
      : sortBy === "year"
        ? { year: direction }
        : sortBy === "department"
          ? { department: direction }
          : sortBy === "subject"
            ? { subject: { name: direction } }
            : sortBy === "totalLectures"
              ? { totalLectures: direction }
              : sortBy === "enrollments"
                ? { enrollments: { _count: direction } }
                : sortBy === "teachings"
                  ? { teachingAssignments: { _count: direction } }
                  : { semester: "asc" };

  const [offerings, totalCount] = await Promise.all([
    prisma.subjectOffering.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        year: true,
        semester: true,
        createdAt: true,
        department: true,
        totalLectures: true,
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            creditHours: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            teachingAssignments: true,
          },
        },
      },
    }),
    prisma.subjectOffering.count({ where }),
  ]);

  return { offerings, totalCount };
}

export type AdminGetOfferingsType = Awaited<
  ReturnType<typeof getAdminOfferings>
>["offerings"][number];
