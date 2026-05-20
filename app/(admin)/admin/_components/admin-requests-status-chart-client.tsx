"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { AdminRequestsStatusChartPoint } from "@/app/data/admin/get-admin-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type AdminRequestsStatusChartClientProps = {
  data: AdminRequestsStatusChartPoint[];
};

const chartConfig = {
  approved: {
    label: "Approved/Resolved",
    color: "var(--chart-1)",
  },
  unresolved: {
    label: "Unresolved/Pending",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AdminRequestsStatusChartClient({
  data,
}: AdminRequestsStatusChartClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests & Complaints Status</CardTitle>
        <CardDescription>
          Approved/Resolved vs Unresolved/Pending requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="approved"
              stackId="a"
              fill="var(--chart-1)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="unresolved"
              stackId="a"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
