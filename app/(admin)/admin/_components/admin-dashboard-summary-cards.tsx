import { IconTrendingUp } from "@tabler/icons-react";

import { getAdminDashboardSummary } from "@/app/data/admin/get-admin-dashboard";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function AdminDashboardSummaryCards() {
  const summary = await getAdminDashboardSummary();

  return (
    <section className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users Joined</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.totalUsersJoined}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All registered users in the system
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Includes students, professors, clerk, and admin
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Leave Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.totalLeaveRequests}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Approved {summary.approvedLeaveRequests} (
            {summary.leaveApprovalRate}%)
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Leave requests approved by HOD review
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Complaints</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.totalComplaints}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Resolved {summary.resolvedComplaints} (
            {summary.complaintResolutionRate}%)
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Complaints closed with a final HOD decision
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

export function AdminDashboardSummaryCardsSkeleton() {
  return (
    <section className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription className="h-4 w-32 animate-pulse rounded bg-muted" />
            <CardTitle className="h-8 w-20 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="h-4 w-52 animate-pulse rounded bg-muted" />
            <div className="h-4 w-44 animate-pulse rounded bg-muted" />
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}
