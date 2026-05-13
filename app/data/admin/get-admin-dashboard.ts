import "server-only";

import { subDays } from "date-fns";

import { ComplaintStatus, LeaveStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

export type AdminUsersJoinedChartPoint = {
  date: string;
  usersJoined: number;
};

export async function getAdminDashboardSummary() {
  const [
    totalUsersJoined,
    totalLeaveRequests,
    approvedLeaveRequests,
    totalComplaints,
    resolvedComplaints,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.leaveRequest.count(),
    prisma.leaveRequest.count({
      where: {
        status: LeaveStatus.APPROVED,
      },
    }),
    prisma.complaint.count(),
    prisma.complaint.count({
      where: {
        status: {
          in: [ComplaintStatus.HOD_ACCEPTED, ComplaintStatus.HOD_REJECTED],
        },
      },
    }),
  ]);

  return {
    totalUsersJoined,
    totalLeaveRequests,
    approvedLeaveRequests,
    leaveApprovalRate: calculateRate(approvedLeaveRequests, totalLeaveRequests),
    totalComplaints,
    resolvedComplaints,
    complaintResolutionRate: calculateRate(resolvedComplaints, totalComplaints),
  };
}

export type AdminDashboardSummary = Awaited<
  ReturnType<typeof getAdminDashboardSummary>
>;

export async function getAdminUsersJoinedByDays() {
  const lookbackDays = 60;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = subDays(new Date(), lookbackDays - 1);
  startDate.setHours(0, 0, 0, 0);

  const joinedUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const joinedByDate = new Map<string, number>();

  for (let dayOffset = 0; dayOffset < lookbackDays; dayOffset += 1) {
    const date = subDays(endDate, lookbackDays - 1 - dayOffset);
    const isoDate = date.toISOString().split("T")[0];
    joinedByDate.set(isoDate, 0);
  }

  for (const user of joinedUsers) {
    const isoDate = user.createdAt.toISOString().split("T")[0];
    joinedByDate.set(isoDate, (joinedByDate.get(isoDate) ?? 0) + 1);
  }

  return Array.from(joinedByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, usersJoined]) => ({
      date,
      usersJoined,
    }));
}

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}
