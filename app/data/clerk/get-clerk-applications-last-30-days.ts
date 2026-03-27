import "server-only";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getClerkApplicationsLast30Days() {
  const can = await requirePermission({ applications: ["dashboard"] });

  if (!can) {
    return redirect("/unauthorized");
  }

  const today = new Date();
  const endDateInclusive = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const endDateExclusive = new Date(endDateInclusive);
  endDateExclusive.setUTCDate(endDateExclusive.getUTCDate() + 1);

  const startDate = new Date(endDateInclusive);
  startDate.setUTCDate(startDate.getUTCDate() - 29);

  const applications = await prisma.studentApplication.findMany({
    where: {
      OR: [
        {
          submittedAt: {
            gte: startDate,
            lt: endDateExclusive,
          },
        },
        {
          submittedAt: null,
          createdAt: {
            gte: startDate,
            lt: endDateExclusive,
          },
        },
      ],
    },
    select: {
      createdAt: true,
      submittedAt: true,
    },
  });

  const countsByDay = new Map<string, number>();

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + i);
    countsByDay.set(toDateKey(date), 0);
  }

  for (const application of applications) {
    const eventDate = application.submittedAt ?? application.createdAt;
    const key = toDateKey(eventDate);
    if (!countsByDay.has(key)) {
      continue;
    }
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  return Array.from(countsByDay.entries()).map(([date, applicationsCount]) => ({
    date,
    applications: applicationsCount,
  }));
}

export type ClerkApplicationsLast30DaysPoint = Awaited<
  ReturnType<typeof getClerkApplicationsLast30Days>
>[number];
