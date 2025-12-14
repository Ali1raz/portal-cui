import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import "server-only";

export async function adminGetUserData(userId: string) {
  // fake delay
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
          program: true,
          batch: true,
          department: true,
          registrationNo: true,
          year: true,
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
