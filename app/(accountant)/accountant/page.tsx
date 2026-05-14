import { Metadata } from "next";
import { requireSession } from "@/app/data/session/require-session";
import { Suspense } from "react";
import { AdminPaymentsChartClient } from "@/app/(admin)/admin/_components/admin-payments-chart-client";
import { getAdminPaymentsByDays } from "@/app/data/admin/get-admin-dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Accountant dashboard — manage fee, installments and announcements for students.",
};

export default async function AccountantDashboardPage() {
  const session = await requireSession();

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Welcome,{" "}
          <span className="text-primary">
            {session.user.name.split(" ")[0]}
          </span>
        </h1>
        <p className="text-muted-foreground">
          Manage fee, installments and announcements for students.
        </p>
      </div>

      <div>
        <Suspense fallback={<PaymentsChartSkeleton />}>
          <AccountantPaymentsChartWrapper />
        </Suspense>
      </div>
    </div>
  );

  async function AccountantPaymentsChartWrapper() {
    const data = await getAdminPaymentsByDays();
    return <AdminPaymentsChartClient data={data} />;
  }

  function PaymentsChartSkeleton() {
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
}
