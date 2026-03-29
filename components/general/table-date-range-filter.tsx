"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange, DayPicker } from "react-day-picker";
import type { ComponentProps } from "react";

type CalendarProps = Omit<
  ComponentProps<typeof DayPicker>,
  "mode" | "selected" | "onSelect"
>;

type TableDateRangeFilterProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  calendarProps?: CalendarProps;
};

export function TableDateRangeFilter({
  value,
  onChange,
  className,
  placeholder = "Pick a date range",
  calendarProps,
}: TableDateRangeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-64 justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}
