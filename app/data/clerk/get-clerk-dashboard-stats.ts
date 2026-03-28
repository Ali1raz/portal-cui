import "server-only";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

export async function getClerkDashboardStats() {
  const can = await requirePermission({ applications: ["dashboard"] });

  if (!can) {
    return redirect("/unauthorized");
  }

  const last30DaysStart = new Date();
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);

  const [totalApplications, totalPending, totalApproved, activeSemesters] =
    await prisma.$transaction([
      prisma.studentApplication.count({
        where: {
          createdAt: {
            gte: last30DaysStart,
          },
        },
      }),
      prisma.studentApplication.count({
        where: {
          status: "PENDING",
          createdAt: {
            gte: last30DaysStart,
          },
        },
      }),
      prisma.studentApplication.count({
        where: {
          status: "APPROVED",
          createdAt: {
            gte: last30DaysStart,
          },
        },
      }),
      prisma.semester.count({
        where: {
          isActive: true,
          updatedAt: {
            gte: last30DaysStart,
          },
        },
      }),
    ]);

  return {
    totalApplications,
    totalPending,
    totalApproved,
    activeSemesters,
  };
}

export type ClerkDashboardStats = Awaited<
  ReturnType<typeof getClerkDashboardStats>
>;
