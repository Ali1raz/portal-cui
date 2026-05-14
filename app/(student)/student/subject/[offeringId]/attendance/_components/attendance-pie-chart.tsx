"use client";

import { LabelList, Pie, PieChart, Cell } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type AttendancePieChartProps = {
  presentCount: number;
  absentCount: number;
  leaveCount: number;
};

const chartConfig = {
  count: {
    label: "Count",
  },
  present: {
    label: "Present",
    color: "var(--chart-1)",
  },
  absent: {
    label: "Absent",
    color: "var(--chart-2)",
  },
  leave: {
    label: "Leave",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function AttendancePieChart({
  presentCount,
  absentCount,
  leaveCount,
}: AttendancePieChartProps) {
  const chartData = [
    {
      status: "present",
      count: presentCount,
      fill:
        (chartConfig.present as { color?: string })?.color ?? "var(--chart-1)",
    },
    {
      status: "absent",
      count: absentCount,
      fill:
        (chartConfig.absent as { color?: string })?.color ?? "var(--chart-2)",
    },
    {
      status: "leave",
      count: leaveCount,
      fill:
        (chartConfig.leave as { color?: string })?.color ?? "var(--chart-3)",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-72 [&_.recharts-text]:fill-background"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="count" hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            outerRadius={80}
            innerRadius={28}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="status"
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(value: string | number) => {
                const key = String(value) as keyof typeof chartConfig;
                return chartConfig[key]?.label ?? String(value);
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="flex flex-row sm:flex-col gap-2 text-center text-sm *:sm:min-w-36">
        <div className="rounded-md border bg-muted/40 px-2 py-1.5">
          <p className="text-muted-foreground">Present</p>
          <p className="font-semibold tabular-nums">{presentCount}</p>
        </div>
        <div className="rounded-md border bg-muted/40 px-2 py-1.5">
          <p className="text-muted-foreground">Absent</p>
          <p className="font-semibold tabular-nums">{absentCount}</p>
        </div>
        <div className="rounded-md border bg-muted/40 px-2 py-1.5">
          <p className="text-muted-foreground">Leave</p>
          <p className="font-semibold tabular-nums">{leaveCount}</p>
        </div>
      </div>
    </div>
  );
}
