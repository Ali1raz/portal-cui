import { Metadata } from "next";
import { Suspense } from "react";

import {
  AdminDashboardSummaryCards,
  AdminDashboardSummaryCardsSkeleton,
} from "./_components/admin-dashboard-summary-cards";

import { getAdminUsersJoinedByDays } from "@/app/data/admin/get-admin-dashboard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminTotalUsersJoinedChartClient } from "./_components/admin-total-users-joined-chart-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard.",
};

export default function Page() {
  return (
    <main className="@container/main flex flex-1 flex-col gap-4 py-2 md:gap-6 ">
      <Suspense fallback={<AdminDashboardSummaryCardsSkeleton />}>
        <AdminDashboardSummaryCards />
      </Suspense>

      <Suspense fallback={<AdminTotalUsersJoinedChartWrapperSkeleton />}>
        <AdminTotalUsersJoinedChartWrapper />
      </Suspense>
    </main>
  );
}

export async function AdminTotalUsersJoinedChartWrapper() {
  const data = await getAdminUsersJoinedByDays();

  return <AdminTotalUsersJoinedChartClient data={data} />;
}

export function AdminTotalUsersJoinedChartWrapperSkeleton() {
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="h-6 w-56 animate-pulse rounded bg-muted" />
          <CardDescription className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-44 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="h-80 w-full animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}
