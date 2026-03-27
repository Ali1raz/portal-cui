import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireSession } from "../session/require-session";
import type { ClerkApplicationsSearchParams } from "@/app/(clerk)/clerk/applications/clerk-applications-search-params";

type GetClerkApplicationsParams = Pick<
  ClerkApplicationsSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "query" | "status"
>;

export async function getClerkApplications({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  status,
}: GetClerkApplicationsParams) {
  await requireSession();

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  const where: Prisma.StudentApplicationWhereInput = {
    ...(status ? { status } : {}),
    ...(trimmedQuery
      ? {
          OR: [{ fullName: { contains: trimmedQuery, mode: "insensitive" } }],
        }
      : {}),
  };

  const orderBy: Prisma.StudentApplicationOrderByWithRelationInput =
    sortBy === "fullName"
      ? { fullName: direction }
      : sortBy === "preferredDepartment"
        ? { preferredDepartment: direction }
        : sortBy === "status"
          ? { status: direction }
          : sortBy === "submittedAt"
            ? { submittedAt: direction }
            : { submittedAt: "desc" };

  const [applications, totalCount] = await Promise.all([
    prisma.studentApplication.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      where,
      orderBy,
      select: {
        id: true,
        fullName: true,
        preferredDepartment: true,
        status: true,
        submittedAt: true,
        createdAt: true,
      },
    }),
    prisma.studentApplication.count({ where }),
  ]);

  return { applications, totalCount };
}

export type ClerkApplicationListItem = Awaited<
  ReturnType<typeof getClerkApplications>
>["applications"][number];
