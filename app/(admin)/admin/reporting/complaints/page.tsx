import { Metadata } from "next";
import { Suspense } from "react";

import { getAdminReportingComplaints } from "@/app/data/admin/get-reporting-complaints";
import { reportingComplaintsSearchParamsCache } from "./complaints-search-params";
import type { ReportingComplaintsSearchParams } from "./complaints-search-params";
import { ReportingComplaintsTable } from "./_components/reporting-complaints-table";
import { DownloadComplaintsReportButton } from "./download-complaints-report-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Complaints Reporting",
  description: "View complaints across all departments.",
};

export default async function ReportingComplaintsPage(
  props: PageProps<"/admin/reporting/complaints">
) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">Complaints Reporting</h1>
              <p className="text-muted-foreground">
                View complaints across all departments.
              </p>
            </div>
            <DownloadComplaintsReportButton searchParams={searchParams} />
          </div>

          <div className="my-2 max-w-7xl">
            <Suspense fallback={<ReportingComplaintsTableSkeleton />}>
              <ReportingComplaintsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ReportingComplaintsList({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const parsedParams: ReportingComplaintsSearchParams =
    reportingComplaintsSearchParamsCache.parse(searchParams);

  const { complaints, totalCount } =
    await getAdminReportingComplaints(parsedParams);

  return (
    <ReportingComplaintsTable complaints={complaints} totalCount={totalCount} />
  );
}

function ReportingComplaintsTableSkeleton() {
  return (
    <div className="my-4 rounded-md border">
      <div className="flex flex-wrap gap-4 p-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="rounded-md border-t border-muted/50">
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
    </div>
  );
}
