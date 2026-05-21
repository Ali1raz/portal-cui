"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartColumnIncreasing, ChevronDownIcon } from "lucide-react";

import type { AdminComplaintsChartPoint } from "@/app/data/admin/get-admin-dashboard";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const chartConfig = {
  complaints: {
    label: "Complaints",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const chartRangeValues = [7, 30, 60] as const;

type ChartRange = (typeof chartRangeValues)[number];

function chartRangeLabel(days: ChartRange) {
  return `Last ${days} Days`;
}

function normalizeChartRange(value: number): ChartRange {
  if (chartRangeValues.includes(value as ChartRange)) {
    return value as ChartRange;
  }

  return 30;
}

type AdminComplaintsChartClientProps = {
  data: AdminComplaintsChartPoint[];
};

export function AdminComplaintsChartClient({
  data,
}: AdminComplaintsChartClientProps) {
  const [chartRange, setChartRange] = React.useState<ChartRange>(30);
  const selectedRange = normalizeChartRange(chartRange);

  const filteredData = React.useMemo(
    () => data.slice(data.length - selectedRange),
    [data, selectedRange]
  );

  const totalComplaints = React.useMemo(
    () => filteredData.reduce((total, item) => total + item.complaints, 0),
    [filteredData]
  );

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Complaints - {chartRangeLabel(selectedRange)}</CardTitle>
          <CardDescription>
            Showing {totalComplaints} complaints
          </CardDescription>
        </div>

        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            type="button"
            onClick={() => setChartRange(selectedRange)}
          >
            <ChartColumnIncreasing className="size-4" aria-hidden="true" />
            {chartRangeLabel(selectedRange)}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label="Select chart range"
              >
                <ChevronDownIcon aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Chart Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {chartRangeValues.map((rangeOption) => (
                <DropdownMenuItem
                  key={rangeOption}
                  onSelect={() => setChartRange(rangeOption)}
                >
                  {chartRangeLabel(rangeOption)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-80 w-full"
        >
          <BarChart data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={32}
              allowDecimals={false}
              domain={[0, "auto"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(String(value)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="complaints"
              fill="var(--color-complaints)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
