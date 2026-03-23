/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import type {
  ColumnDef,
  Header,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { StudentGetAttendencesType } from "@/app/data/student/get-student-attendances";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  attendanceSearchParamsParsers,
  type AttendanceSortBy,
} from "../attendance-search-params";
import { APP } from "@/lib/data/utils";

interface AttendanceTableProps {
  rows: StudentGetAttendencesType[];
  totalCount: number;
}

const statusOptions = Object.values(AttendanceStatus);

/// Convert date range selection to query string value.
function toDateKey(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : null;
}

/// Parse query date into Date instance.
function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Attendance table with filters, sorting, and pagination.
export default function AttendanceTable({
  rows,
  totalCount,
}: AttendanceTableProps) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();

  /// URL-synced sorting, pagination, and filters using nuqs.
  const [queryState, setQueryState] = useQueryStates(
    attendanceSearchParamsParsers,
    {
      history: "replace",
      shallow: false,
    }
  );

  const sorting: SortingState = queryState.sortBy
    ? [{ id: queryState.sortBy, desc: queryState.sortDir === "desc" }]
    : [];

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const selectedStatuses = React.useMemo(() => {
    if (!queryState.status) return [] as AttendanceStatus[];
    return queryState.status
      .split(",")
      .map((status) => status.trim())
      .filter(Boolean) as AttendanceStatus[];
  }, [queryState.status]);

  const dateRange = React.useMemo<DateRange>(() => {
    return {
      from: parseDateKey(queryState.dateFrom),
      to: parseDateKey(queryState.dateTo),
    };
  }, [queryState.dateFrom, queryState.dateTo]);

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "date" ||
    queryState.sortDir !== "desc" ||
    queryState.topic.length > 0 ||
    queryState.status.length > 0 ||
    queryState.dateFrom.length > 0 ||
    queryState.dateTo.length > 0;

  const columns = React.useMemo<ColumnDef<StudentGetAttendencesType>[]>(
    () => [
      {
        id: "srNo",
        header: "Sr No.",
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </div>
        ),
      },
      {
        id: "date",
        header: "Date",
        accessorFn: (row) => row.record.date,
        cell: ({ row }) => <span>{formatDate(row.original.record.date)}</span>,
      },
      {
        id: "time",
        header: "Time",
        enableSorting: false,
        cell: ({ row }) => (
          <span>
            {row.original.record.startTime} - {row.original.record.endTime}
          </span>
        ),
      },
      {
        id: "topic",
        header: "Topic",
        accessorFn: (row) => row.record.topic,
        cell: ({ row }) => <p>{row.original.record.topic}</p>,
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "PRESENT"
                ? "success"
                : row.original.status === "ABSENT"
                  ? "destructive"
                  : "secondary"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "date") as AttendanceSortBy,
          sortDir: next?.desc ? "desc" : "asc",
          page: 1,
        });
      });
    },
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      const nextPageIndex =
        nextPagination.pageSize === pagination.pageSize
          ? nextPagination.pageIndex
          : 0;

      startTransition(() => {
        void setQueryState({
          page: nextPageIndex + 1,
          pageSize: nextPagination.pageSize,
        });
      });
    },
    state: {
      sorting,
      pagination,
    },
    enableSortingRemoval: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
  });

  function handleStatusChange(values: string[]) {
    startTransition(() => {
      void setQueryState({
        status: values.length ? values.join(",") : null,
        page: 1,
      });
    });
  }

  function handleDateRangeChange(range: DateRange | undefined) {
    startTransition(() => {
      void setQueryState({
        dateFrom: range?.from ? toDateKey(range.from) : null,
        dateTo: range?.to ? toDateKey(range.to) : null,
        page: 1,
      });
    });
  }

  return (
    <div className="space-y-6" aria-busy={isPending}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full max-w-md">
            <Label htmlFor="attendance-topic" className="sr-only">
              Search by topic
            </Label>
            <Input
              id="attendance-topic"
              placeholder="Search by topic"
              value={queryState.topic}
              onChange={(event) => {
                const nextValue = event.target.value;

                startTransition(() => {
                  void setQueryState({
                    topic: nextValue.trim().length > 0 ? nextValue : null,
                    page: 1,
                  });
                });
              }}
            />
          </div>

          {hasActiveParams ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                startTransition(() => {
                  void setQueryState(null);
                });
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={selectedStatuses}
              onValueChange={handleStatusChange}
              spacing={1}
            >
              {statusOptions.map((status) => (
                <ToggleGroupItem key={status} value={status}>
                  {status}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Attendance Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <span>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </span>
                    ) : (
                      <span>From {format(dateRange.from, "MMM dd, yyyy")}</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Pick date range
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <SortableTableHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Label htmlFor={tableId} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={tableId} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto">
              {APP.page_sizes.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{" "}
            of <span className="text-foreground">{table.getRowCount()}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirst aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLast aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function SortableTableHeader({
  header,
}: {
  header: Header<StudentGetAttendencesType, unknown>;
}) {
  return (
    <TableHead
      aria-sort={
        header.column.getIsSorted() === "asc"
          ? "ascending"
          : header.column.getIsSorted() === "desc"
            ? "descending"
            : "none"
      }
    >
      <div className="flex items-center gap-1">
        <span className="grow truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
        {header.column.getCanSort() ? (
          <Button
            size="icon"
            variant="ghost"
            className="group -mr-1 size-7"
            onClick={header.column.getToggleSortingHandler()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                header.column.getToggleSortingHandler()?.(event);
              }
            }}
            aria-label="Toggle sorting"
          >
            {{
              asc: (
                <ChevronUp
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              ),
              desc: (
                <ChevronDown
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              ),
            }[header.column.getIsSorted() as string] ?? (
              <ChevronUp
                className="shrink-0 opacity-0 group-hover:opacity-60"
                size={16}
                aria-hidden="true"
              />
            )}
          </Button>
        ) : null}
      </div>
    </TableHead>
  );
}

/// Loading skeleton for attendance table.
export function AttendanceTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24 max-sm:sr-only" />
          <Skeleton className="h-10 w-20" />
        </div>

        <div className="flex grow justify-end">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
