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
  | "batch"
  | "semesterId"
  | "semester"
  | "year"
  | "hasTeacher"
  | "hasEnrollments"
>;

export async function getAdminOfferings({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  department,
  batch,
  semesterId,
  semester,
  year,
  hasTeacher,
  hasEnrollments,
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
            {
              teachingAssignments: {
                some: {
                  professor: {
                    user: {
                      name: { contains: trimmedQuery, mode: "insensitive" },
                    },
                  },
                },
              },
            },
          ],
        }
      : {}),
    ...(department ? { department } : {}),
    ...(batch ? { semester: { batch } } : {}),
    ...(semesterId ? { semesterId } : {}),
    ...(typeof semester === "number" ? { semester: { semester } } : {}),
    ...(typeof year === "number" ? { semester: { year } } : {}),
    ...(hasTeacher === "yes"
      ? { teachingAssignments: { some: {} } }
      : hasTeacher === "no"
        ? { teachingAssignments: { none: {} } }
        : {}),
    ...(hasEnrollments === "yes"
      ? { enrollments: { some: {} } }
      : hasEnrollments === "no"
        ? { enrollments: { none: {} } }
        : {}),
  };

  const orderBy: Prisma.SubjectOfferingOrderByWithRelationInput =
    sortBy === "semester"
      ? { semester: { semester: direction } }
      : sortBy === "year"
        ? { semester: { year: direction } }
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
                  : { semester: { semester: "asc" } };

  const [offerings, totalCount, semesterOptions] = await Promise.all([
    prisma.subjectOffering.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        semester: {
          select: {
            semester: true,
            year: true,
          },
        },
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
        teachingAssignments: {
          select: {
            professor: {
              select: {
                user: {
                  select: {
                    name: true,
                    image: true,
                    id: true,
                    email: true,
                  },
                },
              },
            },
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
    prisma.semester.findMany({
      orderBy: [{ year: "desc" }, { semester: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        semester: true,
        year: true,
        department: true,
        batch: true,
      },
    }),
  ]);

  return { offerings, totalCount, semesterOptions };
}

export type AdminGetOfferingsType = Awaited<
  ReturnType<typeof getAdminOfferings>
>["offerings"][number];

export type AdminOfferingSemesterOption = Awaited<
  ReturnType<typeof getAdminOfferings>
>["semesterOptions"][number];
