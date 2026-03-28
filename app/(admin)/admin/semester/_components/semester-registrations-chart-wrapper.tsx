import { adminGetSemesterRegistrationsByDays } from "@/app/data/admin/get-semester-details";
import { SemesterRegistrationsChart } from "./semester-registrations-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function SemesterRegistrationsChartWrapper({
  semesterId,
  chartDays,
}: {
  semesterId: string;
  chartDays: number;
}) {
  const chartData = await adminGetSemesterRegistrationsByDays(
    semesterId,
    chartDays
  );

  return <SemesterRegistrationsChart data={chartData} chartDays={chartDays} />;
}

export function SemesterRegistrationsChartWrapperSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Registrations</CardTitle>
        <CardDescription>Loading chart data...</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-80 w-full animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}
