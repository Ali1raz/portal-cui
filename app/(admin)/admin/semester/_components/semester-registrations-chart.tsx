"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AdminSemesterRegistrationsByDayPoint } from "@/app/data/admin/get-semester-details";
import { SemesterChartRangeDropdown } from "./semester-chart-range-dropdown";

type SemesterRegistrationsChartProps = {
  data: AdminSemesterRegistrationsByDayPoint[];
  chartDays: number;
};

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SemesterRegistrationsChart({
  data,
  chartDays,
}: SemesterRegistrationsChartProps) {
  const totalRegistrations = React.useMemo(
    () =>
      data.reduce(
        (accumulator, current) => accumulator + current.registrations,
        0
      ),
    [data]
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Registrations - Last {chartDays} Days</CardTitle>
            <CardDescription>
              Total registrations: {totalRegistrations}
            </CardDescription>
          </div>
          <SemesterChartRangeDropdown />
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="registrations"
                fill={chartConfig.registrations.color}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
