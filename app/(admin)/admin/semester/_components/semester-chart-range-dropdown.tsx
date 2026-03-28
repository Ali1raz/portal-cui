"use client";

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
  normalizeSemesterChartDays,
  semesterChartDaysValues,
  semesterChartSearchParamsParsers,
  type SemesterChartDays,
} from "@/app/(admin)/admin/semester/[semesterId]/semester-chart-search-params";
import { ChevronDownIcon, ChartColumnIncreasing } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useTransition } from "react";

function semesterChartRangeLabel(days: SemesterChartDays): string {
  return `Last ${days} Days`;
}

export function SemesterChartRangeDropdown() {
  const [isPending, startTransition] = useTransition();
  const [queryState, setQueryState] = useQueryStates(
    semesterChartSearchParamsParsers,
    {
      history: "replace",
      shallow: false,
    }
  );

  const selectedChartDays = normalizeSemesterChartDays(queryState.chartDays);

  function setChartRange(nextRange: SemesterChartDays) {
    startTransition(() => {
      void setQueryState({ chartDays: nextRange });
    });
  }

  return (
    <ButtonGroup aria-busy={isPending}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setChartRange(selectedChartDays)}
      >
        <ChartColumnIncreasing className="size-4" aria-hidden="true" />
        {semesterChartRangeLabel(selectedChartDays)}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Select chart range">
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Chart Range</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {semesterChartDaysValues.map((rangeOption) => (
            <DropdownMenuItem
              key={rangeOption}
              onSelect={() => setChartRange(rangeOption)}
            >
              {semesterChartRangeLabel(rangeOption)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
