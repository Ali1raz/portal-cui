import { getStudentLeaveRequests } from "@/app/data/student/get-leave-requests";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { LeaveRequestsTable } from "./_components/leave-requests-table";

function LeaveRequestsTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

export default async function LeaveRequestsPage() {
  const requests = await getStudentLeaveRequests();
  return (
    <div className="p-8">
      <div className="flex sm:justify-between sm:flex-row flex-col gap-4">
        <h2 className="text-2xl font-bold mb-6">My Leave Requests</h2>
        <Link href="/student/request-leave">Create a new Leave Request</Link>
      </div>
      <Suspense fallback={<LeaveRequestsTableSkeleton />}>
        <LeaveRequestsTable requests={requests} />
      </Suspense>
    </div>
  );
}
