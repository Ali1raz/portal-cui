import "server-only";

import { subDays } from "date-fns";

import {
  ComplaintStatus,
  LeaveStatus,
  StudentFeeInstallmentStatus,
} from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

export type AdminUsersJoinedChartPoint = {
  date: string;
  usersJoined: number;
};

export type AdminLeaveRequestsChartPoint = {
  date: string;
  leaveRequests: number;
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

export async function getAdminLeaveRequestsByDays() {
  const lookbackDays = 60;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = subDays(new Date(), lookbackDays - 1);
  startDate.setHours(0, 0, 0, 0);

  const leaveRequests = await prisma.leaveRequest.findMany({
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

  const requestsByDate = new Map<string, number>();

  for (let dayOffset = 0; dayOffset < lookbackDays; dayOffset += 1) {
    const date = subDays(endDate, lookbackDays - 1 - dayOffset);
    const isoDate = date.toISOString().split("T")[0];
    requestsByDate.set(isoDate, 0);
  }

  for (const request of leaveRequests) {
    const isoDate = request.createdAt.toISOString().split("T")[0];
    requestsByDate.set(isoDate, (requestsByDate.get(isoDate) ?? 0) + 1);
  }

  return Array.from(requestsByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, leaveRequests]) => ({
      date,
      leaveRequests,
    }));
}

export type AdminComplaintsChartPoint = {
  date: string;
  complaints: number;
};

export async function getAdminComplaintsByDays() {
  const lookbackDays = 60;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = subDays(new Date(), lookbackDays - 1);
  startDate.setHours(0, 0, 0, 0);

  const complaints = await prisma.complaint.findMany({
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

  const complaintsByDate = new Map<string, number>();

  for (let dayOffset = 0; dayOffset < lookbackDays; dayOffset += 1) {
    const date = subDays(endDate, lookbackDays - 1 - dayOffset);
    const isoDate = date.toISOString().split("T")[0];
    complaintsByDate.set(isoDate, 0);
  }

  for (const complaint of complaints) {
    const isoDate = complaint.createdAt.toISOString().split("T")[0];
    complaintsByDate.set(isoDate, (complaintsByDate.get(isoDate) ?? 0) + 1);
  }

  return Array.from(complaintsByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, complaints]) => ({
      date,
      complaints,
    }));
}

export type AdminRequestsStatusChartPoint = {
  name: string;
  approved: number;
  unresolved: number;
};

export async function getAdminRequestsStatusData(): Promise<
  AdminRequestsStatusChartPoint[]
> {
  const [
    approvedLeaveRequests,
    unresolvedLeaveRequests,
    resolvedComplaints,
    unresolvedComplaints,
  ] = await prisma.$transaction([
    prisma.leaveRequest.count({
      where: {
        status: LeaveStatus.APPROVED,
      },
    }),
    prisma.leaveRequest.count({
      where: {
        status: {
          in: [
            LeaveStatus.PENDING,
            LeaveStatus.REVIEW_REQUESTED,
            LeaveStatus.HOD_PENDING,
            LeaveStatus.REJECTED,
          ],
        },
      },
    }),
    prisma.complaint.count({
      where: {
        status: {
          in: [ComplaintStatus.HOD_ACCEPTED, ComplaintStatus.HOD_REJECTED],
        },
      },
    }),
    prisma.complaint.count({
      where: {
        status: {
          in: [
            ComplaintStatus.BA_PENDING,
            ComplaintStatus.BA_REVIEW_REQUESTED,
            ComplaintStatus.BA_REJECTED,
            ComplaintStatus.HOD_PENDING,
            ComplaintStatus.ASSIGNED,
          ],
        },
      },
    }),
  ]);

  return [
    {
      name: "Leave Requests",
      approved: approvedLeaveRequests,
      unresolved: unresolvedLeaveRequests,
    },
    {
      name: "Complaints",
      approved: resolvedComplaints,
      unresolved: unresolvedComplaints,
    },
  ];
}

export type AdminPaymentsChartPoint = {
  date: string;
  amount: number;
};

export async function getAdminPaymentsByDays() {
  const lookbackDays = 60;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = subDays(new Date(), lookbackDays - 1);
  startDate.setHours(0, 0, 0, 0);

  const paidInstallments = await prisma.studentFeeInstallment.findMany({
    where: {
      status: StudentFeeInstallmentStatus.PAID,
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      paidAt: true,
      amount: true,
    },
  });

  const paymentsByDate = new Map<string, number>();

  for (let dayOffset = 0; dayOffset < lookbackDays; dayOffset += 1) {
    const date = subDays(endDate, lookbackDays - 1 - dayOffset);
    const isoDate = date.toISOString().split("T")[0];
    paymentsByDate.set(isoDate, 0);
  }

  for (const p of paidInstallments) {
    const isoDate = p.paidAt!.toISOString().split("T")[0];
    paymentsByDate.set(
      isoDate,
      (paymentsByDate.get(isoDate) ?? 0) + Number(p.amount)
    );
  }

  return Array.from(paymentsByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100,
    }));
}

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}
