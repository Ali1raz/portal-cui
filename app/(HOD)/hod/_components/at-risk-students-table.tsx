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
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
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
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";
import { HodAtRiskStudentType } from "@/app/data/hod/get-at-risk-students";
import { APP } from "@/lib/data/utils";
import { useQueryStates } from "nuqs";
import {
  atRiskStudentsSearchParamsParsers,
  type AtRiskStudentsSortBy,
} from "../at-risk-students-search-params";

/// At‑risk students table with server-side search, sorting, pagination, and DND.
export function AtRiskStudentsTable({
  students,
  totalCount,
}: {
  /// Student rows to display in the table.
  students: HodAtRiskStudentType[];
  /// Total students count for pagination.
  totalCount: number;
}) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();

  const [queryState, setQueryState] = useQueryStates(
    atRiskStudentsSearchParamsParsers,
    {
      history: "replace",
      shallow: false,
      limitUrlUpdates: {
        method: "throttle",
        timeMs: 1500,
      },
    }
  );

  const sorting: SortingState = queryState.sortBy
    ? [{ id: queryState.sortBy, desc: queryState.sortDir === "desc" }]
    : [];

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "effectivePct" ||
    queryState.sortDir !== "asc" ||
    queryState.query.length > 0;

  const columns = React.useMemo<ColumnDef<HodAtRiskStudentType>[]>(
    () => [
      {
        id: "srNo",
        header: "Sr No.",
        cell: ({ row }) => <div>{row.index + 1}</div>,
        enableSorting: false,
      },
      {
        id: "student",
        header: "Student",
        accessorFn: (row) => row.studentName,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.studentName}</span>
            <span className="text-muted-foreground text-xs">
              {row.original.registrationNo}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "subject",
        header: "Subject",
        accessorFn: (row) => row.subjectCode,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.subjectCode}</span>
            <span className="text-muted-foreground text-xs truncate max-w-[180px]">
              {row.original.subjectName}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "effectivePct",
        header: () => (
          <span title="(Present + Leave) / Total × 100">Effective %</span>
        ),
        accessorFn: (row) => row.effectivePct,
        cell: ({ row }) => {
          const pct = row.original.effectivePct;
          const isAtRisk = pct < APP.EFFECTIVE_THRESHOLD_PCT;
          return (
            <Badge
              variant={isAtRisk ? "destructive" : "secondary"}
              appearance="light"
              size="sm"
              className="tabular-nums"
            >
              {pct}%
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        id: "rawPct",
        header: () => <span title="Present / Total × 100">Raw %</span>,
        accessorFn: (row) => row.rawPct,
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.rawPct}%</span>
        ),
        enableSorting: true,
      },
      {
        id: "total",
        header: "Total",
        accessorFn: (row) => row.total,
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.total}</span>
        ),
        enableSorting: true,
      },
      {
        id: "present",
        header: "P",
        accessorFn: (row) => row.present,
        cell: ({ row }) => (
          <span className="tabular-nums text-green-600 dark:text-green-400">
            {row.original.present}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "leave",
        header: "L",
        accessorFn: (row) => row.leave,
        cell: ({ row }) => (
          <span className="tabular-nums text-amber-600 dark:text-amber-400">
            {row.original.leave}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "absent",
        header: "A",
        accessorFn: (row) => row.absent,
        cell: ({ row }) => (
          <span className="tabular-nums text-red-600 dark:text-red-400">
            {row.original.absent}
          </span>
        ),
        enableSorting: true,
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data: students,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "effectivePct") as AtRiskStudentsSortBy,
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
    getRowId: (row) => `${row.studentId}|${row.offeringId}`,
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

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  if (totalCount === 0 && !queryState.query) {
    return (
      <div className="rounded-md border bg-muted/30 p-6 text-center text-muted-foreground">
        <p>
          No at-risk students. All enrolled students meet the 80% effective
          attendance threshold.
        </p>
      </div>
    );
  }

  /// URL-synced at-risk students search and pagination.
  return (
    <div className="w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <Label htmlFor="at-risk-search" className="sr-only">
            Search at-risk students
          </Label>
          <Input
            id="at-risk-search"
            placeholder="Search by student or subject..."
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
      </div>

      {hasActiveParams ? (
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              startTransition(() => {
                void setQueryState(null);
              });
            }}
          >
            <XIcon className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
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
                      <DraggableTableHeader<HodAtRiskStudentType>
                        key={header.id}
                        header={header}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow className="group" key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell<HodAtRiskStudentType> cell={cell} />
                      </SortableContext>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No at-risk students match the current search.
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
            of{" "}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
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
