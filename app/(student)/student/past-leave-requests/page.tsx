import { getStudentLeaveRequests } from "@/app/data/student/get-leave-requests";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { LeaveRequestsTable } from "./_components/leave-requests-table";
import {
  leaveRequestsSearchParamsCache,
  type StudentLeaveRequestsSearchParams,
} from "./leave-requests-search-params";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";

/// Loading skeleton for student leave requests table.
function LeaveRequestsTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
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

export default async function LeaveRequestsPage(
  props: PageProps<"/student/past-leave-requests">
) {
  return (
    <div className="@container/main p-4 md:px-8 space-y-4">
      <div className="flex sm:justify-between sm:flex-row items-baseline flex-col gap-4">
        <h2 className="text-2xl font-bold">My Leave Requests</h2>
        <Link
          href="/student/request-leave"
          className={buttonVariants({ size: "sm" })}
        >
          New Leave Request
        </Link>
      </div>

      <Suspense fallback={<LeaveRequestsTableSkeleton />}>
        <LeaveRequestsList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

/// Server wrapper for leave requests table data.
async function LeaveRequestsList({
  searchParams,
}: {
  searchParams: PageProps<"/student/past-leave-requests">["searchParams"];
}) {
  const parsedParams: StudentLeaveRequestsSearchParams =
    await leaveRequestsSearchParamsCache.parse(searchParams);
  const { requests, totalCount } = await getStudentLeaveRequests(parsedParams);

  return <LeaveRequestsTable requests={requests} totalCount={totalCount} />;
}
