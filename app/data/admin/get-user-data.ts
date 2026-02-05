import "server-only";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

export async function adminGetUserData(userId: string) {
  const canSeeUser = await requirePermission({
    user: ["get"],
  });

  if (!canSeeUser) {
    return redirect("/unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      student: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
      professor: {
        select: {
          id: true,
          department: true,
          programs: true,
          createdAt: true,
        },
      },
      hod: {
        select: {
          id: true,
          department: true,
          createdAt: true,
        },
      },
      director: {
        select: {
          id: true,
          createdAt: true,
        },
      },
      accountant: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return notFound();
  }

  return user;
}
