import "server-only";

import { subDays } from "date-fns";
import { Department } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

export type HodLeaveRequestsChartPoint = {
  date: string;
  leaveRequests: number;
};

export type HodComplaintsChartPoint = {
  date: string;
  complaints: number;
};

export async function getHodLeaveRequestsByDays(department: Department) {
  const lookbackDays = 60;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = subDays(new Date(), lookbackDays - 1);
  startDate.setHours(0, 0, 0, 0);

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      student: {
        department,
      },
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

export async function getHodComplaintsByDays(department: Department) {
  const lookbackDays = 60;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = subDays(new Date(), lookbackDays - 1);
  startDate.setHours(0, 0, 0, 0);

  const complaints = await prisma.complaint.findMany({
    where: {
      student: {
        department,
      },
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
