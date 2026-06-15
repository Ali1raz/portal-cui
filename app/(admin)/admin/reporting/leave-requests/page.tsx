import { Metadata } from "next";
import { Suspense } from "react";

import {
  getAdminReportingLeaveRequestSemesters,
  getAdminReportingLeaveRequests,
} from "@/app/data/admin/get-reporting-leave-requests";
import { DownloadLeaveReportButton } from "./download-leave-report-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReportingLeaveRequestSearchParams } from "./reporting-leave-request-search-params";
import { reportingLeaveRequestSearchParamsCache } from "./reporting-leave-request-search-params";
import { ReportingLeaveRequestsTable } from "./_components/reporting-leave-requests-table";

export const metadata: Metadata = {
  title: "Leave Requests Reporting",
  description: "View leave requests across all departments.",
};

export default async function ReportingLeaveRequestsPage(
  props: PageProps<"/admin/reporting/leave-requests">
) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">
                Leave Requests Reporting
              </h1>
              <p className="text-muted-foreground">
                View leave requests across all departments.
              </p>
            </div>
            <div>
              <DownloadLeaveReportButton searchParams={searchParams} />
            </div>
          </div>

          <div className="my-2 max-w-7xl">
            <Suspense fallback={<ReportingLeaveRequestsTableSkeleton />}>
              <ReportingLeaveRequestsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ReportingLeaveRequestsList({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const parsedParams: ReportingLeaveRequestSearchParams =
    reportingLeaveRequestSearchParamsCache.parse(searchParams);

  const [{ leaveRequests, totalCount }, semesters] = await Promise.all([
    getAdminReportingLeaveRequests(parsedParams),
    getAdminReportingLeaveRequestSemesters(),
  ]);

  return (
    <ReportingLeaveRequestsTable
      requests={leaveRequests}
      totalCount={totalCount}
      semesters={semesters}
    />
  );
}

function ReportingLeaveRequestsTableSkeleton() {
  return (
    <div className="my-4 rounded-md border">
      <div className="flex flex-wrap gap-4 p-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-36" />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 7 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 7 }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
