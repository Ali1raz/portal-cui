import { hodGetLeaveRequests } from "@/app/data/hod/get-leave-requests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaveRequestSearchParams } from "./leave-request-search-params";
import { leaveRequestSearchParamsCache } from "./leave-request-search-params";
import { LeaveRequestsTable } from "./_components/leave-requests-table";

export default async function LeaveRequestsPage(
  props: PageProps<"/hod/leave-requests">
) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div>
            <h1 className="text-xl font-bold mb-2">Leave Requests</h1>
            <p className="text-muted-foreground">
              Manage and review leave requests from students in your department.
            </p>
          </div>
          <div className="my-2">
            <Suspense fallback={<LeaveRequestsTableSkeleton />}>
              <LeaveRequestsList searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/// Async component that fetches and displays leave requests table
async function LeaveRequestsList({
  searchParams,
}: {
  searchParams: PageProps<"/hod/leave-requests">["searchParams"];
}) {
  const parsedParams: LeaveRequestSearchParams =
    await leaveRequestSearchParamsCache.parse(searchParams);
  const { requests, totalCount } = await hodGetLeaveRequests(parsedParams);

  return <LeaveRequestsTable requests={requests} totalCount={totalCount} />;
}

/// Loading skeleton for leave requests table
function LeaveRequestsTableSkeleton() {
  return (
    <div className="my-4 rounded-md border">
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 8 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 8 }).map((_, cellIndex) => (
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
