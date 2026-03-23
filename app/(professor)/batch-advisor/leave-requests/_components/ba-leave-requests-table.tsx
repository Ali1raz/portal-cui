/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import {
  CalendarIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useQueryStates } from "nuqs";

import type { BaLeaveRequestRow } from "@/app/data/professor/get-ba-leave-requests";
import { APP } from "@/lib/data/utils";
import { cn, formatDate, formatEnumLabel } from "@/lib/utils";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";
import { UserImage } from "@/components/user/user-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  baLeaveRequestStatusValues,
  baLeaveRequestsSearchParamsParsers,
  type BaLeaveRequestsSortBy,
} from "../leave-requests-search-params";
import { MiddleTruncateText } from "@/components/general/truncated-text";
import { RequestActions } from "./request-actions";

function toDateKey(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : "";
}

function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseStatusCsv(value: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => baLeaveRequestStatusValues.includes(item as never));
}

/// Batch Advisor leave requests table with server-side filters and pagination.
export function BaLeaveRequestsTable({
  leaveRequests,
  totalCount,
}: {
  leaveRequests: BaLeaveRequestRow[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();

  const [queryState, setQueryState] = useQueryStates(
    baLeaveRequestsSearchParamsParsers,
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

  const selectedStatuses = React.useMemo(
    () => parseStatusCsv(queryState.status),
    [queryState.status]
  );

  const dateRange = React.useMemo<DateRange>(() => {
    return {
      from: parseDateKey(queryState.dateFrom),
      to: parseDateKey(queryState.dateTo),
    };
  }, [queryState.dateFrom, queryState.dateTo]);

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "createdAt" ||
    queryState.sortDir !== "desc" ||
    queryState.query.length > 0 ||
    queryState.status.length > 0 ||
    queryState.dateFrom.length > 0 ||
    queryState.dateTo.length > 0;

  const columns = React.useMemo<ColumnDef<BaLeaveRequestRow>[]>(
    () => [
      {
        id: "srNo",
        header: "Sr No.",
        enableSorting: false,
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        id: "studentName",
        header: "Student",
        accessorFn: (row) => row.student.user.name,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <UserImage
              image={row.original.student.user.image}
              name={row.original.student.user.name}
            />
            <div className="flex flex-col">
              <span className="font-medium">
                {row.original.student.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.student.registrationNo}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "reasonTitle",
        header: "Reason",
        accessorFn: (row) => row.reasonTitle,
        cell: ({ row }) => (
          <MiddleTruncateText text={row.original.reasonTitle} />
        ),
      },
      {
        id: "date",
        header: "Leave Date",
        accessorFn: (row) => row.date,
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: "createdAt",
        header: "Created At",
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "APPROVED"
                ? "success"
                : row.original.status === "REJECTED"
                  ? "destructive"
                  : "info"
            }
            size="sm"
          >
            {formatEnumLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <RequestActions
              leaveRequestId={row.original.id}
              status={row.original.status}
            />
          </div>
        ),
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data: leaveRequests,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "createdAt") as BaLeaveRequestsSortBy,
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
      columnOrder,
      pagination,
    },
    onColumnOrderChange: setColumnOrder,
    enableSortingRemoval: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setColumnOrder((currentOrder) => {
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        return arrayMove(currentOrder, oldIndex, newIndex);
      });
    }
  }

  function toggleStatus(status: string, checked: boolean) {
    const nextStatuses = checked
      ? [...new Set([...selectedStatuses, status])]
      : selectedStatuses.filter((value) => value !== status);

    startTransition(() => {
      void setQueryState({
        status: nextStatuses.join(","),
        page: 1,
      });
    });
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <div className="w-full space-y-4" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-55">
          <Label htmlFor="ba-leave-requests-search" className="sr-only">
            Search leave requests
          </Label>
          <Input
            id="ba-leave-requests-search"
            placeholder="Search by reason or student"
            value={queryState.query}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => {
                void setQueryState({
                  query: nextValue.trim().length > 0 ? nextValue : "",
                  page: 1,
                });
              });
            }}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-40 justify-between">
              {selectedStatuses.length > 0
                ? `${selectedStatuses.length} selected`
                : "All Status"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2">
              {baLeaveRequestStatusValues.map((statusValue) => {
                const checked = selectedStatuses.includes(statusValue);
                return (
                  <Label
                    key={statusValue}
                    className="flex items-center gap-2 font-normal"
                  >
                    <Checkbox
                      size="sm"
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleStatus(statusValue, Boolean(value))
                      }
                    />
                    {formatEnumLabel(statusValue)}
                  </Label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-64 justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range) => {
                startTransition(() => {
                  void setQueryState({
                    dateFrom: range?.from ? toDateKey(range.from) : "",
                    dateTo: range?.to ? toDateKey(range.to) : "",
                    page: 1,
                  });
                });
              }}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveParams ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            startTransition(() => {
              void setQueryState(null);
            });
          }}
        >
          <XIcon className="size-4" />
          Clear
        </Button>
      ) : null}

      <div className="rounded-md border">
        <DndContext
          id={tableId}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/50 [&>th]:border-t-0"
                >
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader<BaLeaveRequestRow>
                        key={header.id}
                        header={header}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell<BaLeaveRequestRow> cell={cell} />
                      </SortableContext>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
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

        <div className="flex items-center gap-3">
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
