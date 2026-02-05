import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";

export async function getAllUsers() {
  const session = await requireSession();
  const can = await requirePermission({
    user: ["list", "get"],
  });

  if (!can) {
    return [];
  }

  const data = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      id: {
        not: session?.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      email: true,
      banned: true,
      banExpires: true,
      banReason: true,
      emailVerified: true,
      createdAt: true,
      hod: {
        select: {
          id: true,
        },
      },
      professor: {
        select: {
          id: true,
        },
      },
      student: {
        select: {
          id: true,
        },
      },
    },
  });

  return data;
}

export type getAllUsersType = Awaited<ReturnType<typeof getAllUsers>>;
