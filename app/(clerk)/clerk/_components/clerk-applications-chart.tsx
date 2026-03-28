"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
import type { ClerkApplicationsLast30DaysPoint } from "@/app/data/clerk/get-clerk-applications-last-30-days";

type ClerkApplicationsLast30DaysChartProps = {
  data: ClerkApplicationsLast30DaysPoint[];
};

const chartConfig = {
  applications: {
    label: "Applications",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ClerkApplicationsLast30DaysChart({
  data,
}: ClerkApplicationsLast30DaysChartProps) {
  const totalApplications = React.useMemo(
    () =>
      data.reduce(
        (accumulator, current) => accumulator + current.applications,
        0
      ),
    [data]
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Applications in Last 30 Days</CardTitle>
        <CardDescription>
          Total applications submitted in the last 30 days: {totalApplications}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-65 w-full"
        >
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-42.5"
                  labelFormatter={(value) => {
                    const date = new Date(String(value));
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey="applications"
              fill="var(--color-applications)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
