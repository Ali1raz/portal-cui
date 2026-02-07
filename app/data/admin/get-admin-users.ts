import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import type { UsersSearchParams } from "@/app/(admin)/admin/users/users-search-params";

type AdminGetUsersParams = Pick<
  UsersSearchParams,
  "page" | "pageSize" | "sortBy" | "sortDir" | "query" | "role"
>;

/// Fetch paginated admin users with filters.
export async function getAdminUsers({
  page,
  pageSize,
  sortBy,
  sortDir,
  query,
  role,
}: AdminGetUsersParams) {
  const session = await requireSession();
  const can = await requirePermission({
    user: ["list", "get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const direction: Prisma.SortOrder = sortDir;
  const trimmedQuery = query.trim();

  const where: Prisma.UserWhereInput = {
    id: {
      not: session?.user.id,
    },
    ...(role ? { role } : {}),
    ...(trimmedQuery
      ? {
          OR: [
            { name: { contains: trimmedQuery, mode: "insensitive" } },
            { email: { contains: trimmedQuery, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sortBy === "name"
      ? { name: direction }
      : sortBy === "email"
        ? { email: direction }
        : sortBy === "role"
          ? { role: direction }
          : sortBy === "createdAt"
            ? { createdAt: direction }
            : { name: "asc" };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy,
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        professor: {
          select: {
            department: true,
          },
        },
        hod: {
          select: {
            department: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, totalCount };
}

export type AdminGetUsersType = Awaited<
  ReturnType<typeof getAdminUsers>
>["users"][number];
