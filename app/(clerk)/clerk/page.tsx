import { Metadata } from "next";
import { Suspense } from "react";

import { getClerkApplicationsLast30Days } from "@/app/data/clerk/get-clerk-applications-last-30-days";
import { getClerkDashboardStats } from "@/app/data/clerk/get-clerk-dashboard-stats";
import { ClerkApplicationsLast30DaysChart } from "./_components/clerk-applications-chart";
import {
  SectionCards,
  SectionCardsSkeleton,
} from "./_components/section-cards";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Clerk dashboard — review application metrics, recent activity, and processing status.",
};

async function DashboardCardsWrapper() {
  const [stats, chartData] = await Promise.all([
    getClerkDashboardStats(),
    getClerkApplicationsLast30Days(),
  ]);
  return (
    <div className="space-y-6">
      <SectionCards stats={stats} />
      <ClerkApplicationsLast30DaysChart data={chartData} />
    </div>
  );
}

export default function ClerkDashboard() {
  return (
    <div className="w-full overflow-hidden space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clerk Dashboard</h1>
      </div>

      <Suspense fallback={<SectionCardsSkeleton />}>
        <DashboardCardsWrapper />
      </Suspense>
    </div>
  );
}
