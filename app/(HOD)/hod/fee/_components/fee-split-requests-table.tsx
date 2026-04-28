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
import { useQueryStates } from "nuqs";

import { APP } from "@/lib/data/utils";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import { formatFeeAmount } from "@/lib/utils/fee-format";
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
import { UserImage } from "@/components/user/user-image";
import type { HodFeeSplitRequestRow } from "@/app/data/hod/get-fee-split-requests";
import {
  feeSplitStatusValues,
  hodFeeSplitSearchParamsParsers,
  type FeeSplitStatusFilter,
  type HodFeeSplitSortBy,
} from "../fee-split-requests-search-params";
import { FeeSplitRequestActions } from "./fee-split-request-actions";

export function HodFeeSplitRequestsTable({
  requests,
  totalCount,
  semesters,
}: {
  requests: HodFeeSplitRequestRow[];
  totalCount: number;
  semesters: { id: string; label: string }[];
}) {
  "use no memo";

  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();

  const [queryState, setQueryState] = useQueryStates(
    hodFeeSplitSearchParamsParsers,
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

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "createdAt" ||
    queryState.sortDir !== "desc" ||
    queryState.status !== "all" ||
    queryState.semesterId.length > 0 ||
    queryState.query.length > 0;

  const columns = React.useMemo<ColumnDef<HodFeeSplitRequestRow>[]>(
    () => [
      {
        id: "studentName",
        header: "Student",
        accessorFn: (row) => row.student?.user.name ?? "-",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <UserImage
              image={row.original.student?.user.image}
              name={row.original.student?.user.name ?? "Unknown Student"}
            />
            <div className="flex flex-col">
              <span className="font-medium">
                {row.original.student?.user.name ?? "Unknown Student"}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.original.student?.registrationNo ?? "-"}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "registrationNo",
        header: "Reg No",
        accessorFn: (row) => row.student?.registrationNo ?? "-",
        cell: ({ row }) => row.original.student?.registrationNo ?? "-",
      },
      {
        id: "semester",
        header: "Semester",
        accessorFn: (row) =>
          row.feeInstallment?.semesterFee.id ??
          row.studentFeeInstallment?.semesterFee.id ??
          "",
        cell: ({ row }) => {
          const semester =
            row.original.feeInstallment?.semesterFee.semester ??
            row.original.studentFeeInstallment?.semesterFee.semester;
          if (!semester) {
            return "-";
          }

          return `Sem ${semester.semester} ${semester.batch}${semester.year
            .toString()
            .slice(-2)}-${semester.program}${semester.department}`;
        },
      },
      {
        id: "totalFee",
        header: "Total Fee",
        accessorFn: (row) =>
          row.feeInstallment?.semesterFee.totalAmount ??
          row.studentFeeInstallment?.semesterFee.totalAmount ??
          0,
        enableSorting: false,
        cell: ({ row }) =>
          formatFeeAmount(
            row.original.feeInstallment?.semesterFee.totalAmount ??
              row.original.studentFeeInstallment?.semesterFee.totalAmount ??
              0
          ),
      },
      {
        id: "requestedAmount",
        header: "Requested",
        accessorFn: (row) => row.requestedAmount,
        cell: ({ row }) => formatFeeAmount(row.original.requestedAmount),
      },
      {
        id: "preferredDueDate",
        header: "Preferred Due",
        accessorFn: (row) => row.preferredDueDate,
        cell: ({ row }) => formatDate(row.original.preferredDueDate),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <Badge size="sm">{formatEnumLabel(row.original.status)}</Badge>
        ),
      },
      {
        id: "createdAt",
        header: "Submitted",
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: () => <span className="text-center">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <FeeSplitRequestActions requestId={row.original.id} />
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
    data: requests,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "createdAt") as HodFeeSplitSortBy,
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

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <div className="w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-56">
          <Label htmlFor="fee-split-search" className="sr-only">
            Search by student name or registration number
          </Label>
          <Input
            id="fee-split-search"
            placeholder="Search by student name or reg no..."
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

        <Select
          value={queryState.status}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                status: value as FeeSplitStatusFilter,
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {feeSplitStatusValues.map((value) => (
              <SelectItem key={value} value={value}>
                {formatEnumLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={queryState.semesterId || "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                semesterId: value === "all" ? "" : value,
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                      <DraggableTableHeader<HodFeeSplitRequestRow>
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
                  <TableRow
                    className="group"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell<HodFeeSplitRequestRow> cell={cell} />
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
                    No fee split requests found.
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
