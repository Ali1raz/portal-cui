import { Metadata } from "next";
import { Suspense } from "react";
import { getApprovedLeaveRequests } from "@/app/data/admin/get-approved-leave-requests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApprovedLeaveRequestSearchParams } from "./approved-leave-request-search-params";
import { approvedLeaveRequestSearchParamsCache } from "./approved-leave-request-search-params";
import { AdminApprovedLeaveRequestsTable } from "./_components/approved-leave-requests-table";

export const metadata: Metadata = {
  title: "Approved Leave Requests",
  description: "View and manage attendance status for approved leave requests.",
};

export default async function ApprovedLeaveRequestsPage(
  props: PageProps<"/admin/leave-requests/approved">
) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6 ">
          <div>
            <h1 className="text-2xl font-bold mb-2">Approved Leave Requests</h1>
            <p className="text-muted-foreground">
              View approved leave requests and manage attendance overrides.
            </p>
          </div>
          <div className="my-2">
            <Suspense fallback={<ApprovedLeaveRequestsTableSkeleton />}>
              <ApprovedLeaveRequestsList searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/// Async component that fetches and displays approved leave requests table
async function ApprovedLeaveRequestsList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/leave-requests/approved">["searchParams"];
}) {
  const parsedParams: ApprovedLeaveRequestSearchParams =
    await approvedLeaveRequestSearchParamsCache.parse(searchParams);

  const { requests, totalCount } = await getApprovedLeaveRequests({
    page: parsedParams.page,
    pageSize: parsedParams.pageSize,
    sortBy: parsedParams.sortBy,
    sortDir: parsedParams.sortDir,
    query: parsedParams.query,
    startDate: parsedParams.startDate,
    endDate: parsedParams.endDate,
  });

  return (
    <AdminApprovedLeaveRequestsTable
      requests={requests}
      totalCount={totalCount}
    />
  );
}

/// Loading skeleton for approved leave requests table
function ApprovedLeaveRequestsTableSkeleton() {
  return (
    <div className="my-4 rounded-md border">
      <div className="flex flex-wrap gap-4 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 5 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 5 }).map((_, cellIndex) => (
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
