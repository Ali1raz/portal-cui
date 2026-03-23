import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { baGetLeaveRequests } from "@/app/data/professor/get-ba-leave-requests";
import {
  baLeaveRequestsSearchParamsCache,
  type BaLeaveRequestsSearchParams,
} from "./leave-requests-search-params";
import { BaLeaveRequestsTable } from "./_components/ba-leave-requests-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function BALRPage(
  props: PageProps<"/batch-advisor/leave-requests">
) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Leave Requests</h1>
            <p className="text-muted-foreground text-sm">
              Manage leave requests from your department.
            </p>
          </div>
          <div className="my-2">
            <Suspense fallback={<BaLeaveRequestsTableSkeleton />}>
              <BaLeaveRequestsList searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function BaLeaveRequestsList({
  searchParams,
}: {
  searchParams: PageProps<"/batch-advisor/leave-requests">["searchParams"];
}) {
  const parsedParams: BaLeaveRequestsSearchParams =
    await baLeaveRequestsSearchParamsCache.parse(searchParams);

  const { leaveRequests, totalCount } = await baGetLeaveRequests(parsedParams);

  return (
    <BaLeaveRequestsTable
      leaveRequests={leaveRequests}
      totalCount={totalCount}
    />
  );
}

function BaLeaveRequestsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 flex-1 min-w-55" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {Array.from({ length: 6 }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );
}
