import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { subDays } from "date-fns";
import { notFound, redirect } from "next/navigation";

export async function adminGetSemesterdetails(semesterId: string) {
  const can = await requirePermission({
    semesters: ["get"],
  });

  if (!can) {
    redirect("/unauthorized");
  }

  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
  });

  if (!semester) {
    notFound();
  }

  const [totalRegistrations, totalOfferings] = await Promise.all([
    prisma.registration.count({
      where: { semesterId },
    }),
    prisma.subjectOffering.count({
      where: { semesterId },
    }),
  ]);

  return {
    semester,
    totalRegistrations,
    totalOfferings,
  };
}

export async function adminGetSemesterRegistrationsByDays(
  semesterId: string,
  days: number
) {
  const can = await requirePermission({
    semesters: ["get"],
  });

  if (!can) {
    redirect("/unauthorized");
  }

  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
    select: { id: true },
  });

  if (!semester) {
    notFound();
  }

  const lookbackDays = days === 7 || days === 30 || days === 60 ? days : 30;
  const startDate = subDays(new Date(), lookbackDays);

  const registrationsByDate = await prisma.registration.groupBy({
    by: ["createdAt"],
    where: {
      semesterId,
      createdAt: { gte: startDate },
    },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  const dataByDate = new Map<string, number>();

  for (let offset = 0; offset < lookbackDays; offset += 1) {
    const date = subDays(new Date(), lookbackDays - 1 - offset);
    const isoDate = date.toISOString().split("T")[0];
    dataByDate.set(isoDate, 0);
  }

  for (const registrationEntry of registrationsByDate) {
    const isoDate = registrationEntry.createdAt.toISOString().split("T")[0];
    const existingCount = dataByDate.get(isoDate) ?? 0;
    dataByDate.set(isoDate, existingCount + registrationEntry._count);
  }

  return Array.from(dataByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, registrations]) => ({
      date,
      registrations,
    }));
}

export type AdminSemesterDetails = Awaited<
  ReturnType<typeof adminGetSemesterdetails>
>["semester"];

export type AdminSemesterRegistrationsByDayPoint = Awaited<
  ReturnType<typeof adminGetSemesterRegistrationsByDays>
>[number];
