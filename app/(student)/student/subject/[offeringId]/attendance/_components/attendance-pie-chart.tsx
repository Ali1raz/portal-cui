"use client";

import { useState } from "react";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import { Legend } from "@/components/charts/legend/legend";
import { LegendItem } from "@/components/charts/legend/legend-item";
import { LegendMarker } from "@/components/charts/legend/legend-marker";
import { LegendLabel } from "@/components/charts/legend/legend-label";
import { LegendValue } from "@/components/charts/legend/legend-value";

type AttendancePieChartProps = {
  presentCount: number;
  absentCount: number;
  leaveCount: number;
};

const COLORS = {
  present: "var(--chart-1)",
  absent: "var(--destructive)",
  leave: "var(--secondary)",
} as const;

export function AttendancePieChart({
  presentCount,
  absentCount,
  leaveCount,
}: AttendancePieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = presentCount + absentCount + leaveCount;

  const chartData = [
    { label: "Present", value: presentCount, color: COLORS.present },
    { label: "Absent", value: absentCount, color: COLORS.absent },
    { label: "Leave Requests", value: leaveCount, color: COLORS.leave },
  ];

  const legendItems = chartData.map((d) => ({
    label: d.label,
    value: d.value,
    maxValue: total,
    color: d.color,
  }));

  return (
    <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-8 sm:gap-12">
      <PieChart
        data={chartData}
        size={220}
        innerRadius={50}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
      >
        {chartData.map((_, index) => (
          <PieSlice key={index} index={index} showGlow hoverEffect="grow" />
        ))}
        <PieCenter defaultLabel="Total Records" />
      </PieChart>

      <Legend
        items={legendItems}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
        title="Attendance Breakdown"
      >
        <LegendItem className="flex items-center gap-3">
          <LegendMarker />
          <LegendLabel className="flex-1" />
          <LegendValue showPercentage />
        </LegendItem>
      </Legend>
    </div>
  );
}
