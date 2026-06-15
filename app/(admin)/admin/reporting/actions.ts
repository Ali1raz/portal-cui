"use server";

import { getAdminReportingComplaints } from "@/app/data/admin/get-reporting-complaints";
import { reportingComplaintsSearchParamsCache } from "./complaints/complaints-search-params";

import { getAdminReportingLeaveRequests } from "@/app/data/admin/get-reporting-leave-requests";
import { reportingLeaveRequestSearchParamsCache } from "./leave-requests/reporting-leave-request-search-params";

export async function getComplaintsReportData(
  searchParams: Record<string, string | string[] | undefined>
) {
  const parsedParams =
    await reportingComplaintsSearchParamsCache.parse(searchParams);

  const { complaints } = await getAdminReportingComplaints({
    ...parsedParams,
    page: 1,
    pageSize: 10000,
  });

  return complaints;
}

export async function getLeaveReportData(
  searchParams: Record<string, string | string[] | undefined>
) {
  const parsedParams =
    reportingLeaveRequestSearchParamsCache.parse(searchParams);

  const { leaveRequests } = await getAdminReportingLeaveRequests({
    ...parsedParams,
    page: 1,
    pageSize: 10000,
  });

  return leaveRequests;
}
