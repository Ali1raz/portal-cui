"use client";
import * as Progress from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { useLegendItem } from "./legend-context";

export interface LegendProgressProps {
  trackClassName?: string;
  indicatorClassName?: string;
  height?: string;
}

export function LegendProgress({
  trackClassName = "",
  indicatorClassName = "",
  height = "h-1.5",
}: LegendProgressProps) {
  const { item } = useLegendItem();

  if (!item.maxValue) return null;

  const percentage = (item.value / item.maxValue) * 100;

  return (
    <Progress.Root
      max={item.maxValue}
      value={item.value}
      className={cn(
        "w-full overflow-hidden rounded-full bg-legend-track",
        height,
        trackClassName
      )}
    >
      <Progress.Indicator
        className={cn(
          "h-full rounded-full transition-all duration-500",
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - percentage}%)`,
          backgroundColor: item.color,
        }}
      />
    </Progress.Root>
  );
}

LegendProgress.displayName = "LegendProgress";
