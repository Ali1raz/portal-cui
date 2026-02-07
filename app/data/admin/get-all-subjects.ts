import "server-only";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { SubjectsSearchParams } from "@/app/(admin)/admin/subjects/subjects-search-params";

type AdminGetAllSubjectsParams = Pick<
  SubjectsSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "query"
>;

export async function adminGetAllSubjects({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
}: AdminGetAllSubjectsParams) {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();
  const where: Prisma.SubjectWhereInput = trimmedQuery
    ? {
        OR: [
          { name: { contains: trimmedQuery, mode: "insensitive" } },
          { code: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      }
    : {};

  const orderBy: Prisma.SubjectOrderByWithRelationInput =
    sortBy === "name"
      ? { name: direction }
      : sortBy === "code"
        ? { code: direction }
        : sortBy === "creditHours"
          ? { creditHours: direction }
          : sortBy === "offerings"
            ? { offerings: { _count: direction } }
            : { name: "asc" };

  const [subjects, totalCount] = await Promise.all([
    prisma.subject.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        code: true,
        creditHours: true,
        name: true,
        offerings: {
          select: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
    }),
    prisma.subject.count({ where }),
  ]);

  return { subjects, totalCount };
}

export type AdminGetAllSubjectsType = Awaited<
  ReturnType<typeof adminGetAllSubjects>
>["subjects"][number];
