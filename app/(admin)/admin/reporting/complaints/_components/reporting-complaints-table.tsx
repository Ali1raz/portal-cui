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
  X,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { UserImage } from "@/components/user/user-image";
import { TableDateRangeFilter } from "@/components/general/table-date-range-filter";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";
import { MiddleTruncateText } from "@/components/general/truncated-text";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import {
  ComplaintCategory,
  ComplaintStatus,
  Department,
} from "@/lib/generated/prisma/enums";
import { useQueryStates } from "nuqs";
import {
  complaintAttachmentValues,
  reportingComplaintsSearchParamsParsers,
  type ComplaintAttachmentFilter,
  type ReportingComplaintsSortBy,
} from "../complaints-search-params";
import type { AdminReportingComplaintType } from "@/app/data/admin/get-reporting-complaints";
import { APP } from "@/lib/data/utils";

function toDateKey(value: Date | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function ReportingComplaintsTable({
  complaints,
  totalCount,
}: {
  complaints: AdminReportingComplaintType[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();

  const [queryState, setQueryState] = useQueryStates(
    reportingComplaintsSearchParamsParsers,
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

  const dateRange = React.useMemo(() => {
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
    queryState.status !== "all" ||
    queryState.category !== "all" ||
    queryState.department !== "all" ||
    queryState.dateFrom.length > 0 ||
    queryState.dateTo.length > 0 ||
    queryState.hasAttachment !== "all" ||
    queryState.query.length > 0;

  const columns = React.useMemo<ColumnDef<AdminReportingComplaintType>[]>(
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
              className="size-8"
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
        id: "department",
        header: "Department",
        accessorFn: (row) => row.student.department,
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {row.original.student.department}
          </div>
        ),
      },
      {
        id: "title",
        header: "Title",
        accessorFn: (row) => row.title,
        cell: ({ row }) => (
          <div className="max-w-[36ch]">
            <MiddleTruncateText maxLength={80} text={row.original.title} />
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        accessorFn: (row) => row.category,
        cell: ({ row }) => formatEnumLabel(row.original.category),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => <Badge size="sm">{row.original.status}</Badge>,
      },
      {
        id: "createdAt",
        header: "Created",
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data: complaints,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "createdAt") as ReportingComplaintsSortBy,
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

  function handleStatusChange(value: string) {
    startTransition(() => {
      void setQueryState({
        status: value,
        page: 1,
      });
    });
  }

  function handleCategoryChange(value: string) {
    startTransition(() => {
      void setQueryState({
        category: value,
        page: 1,
      });
    });
  }

  function handleDepartmentChange(value: string) {
    startTransition(() => {
      void setQueryState({
        department: value as typeof queryState.department,
        page: 1,
      });
    });
  }

  function handleDateRangeChange(
    range: { from?: Date; to?: Date } | undefined
  ) {
    startTransition(() => {
      void setQueryState({
        dateFrom: range?.from ? toDateKey(range.from) : "",
        dateTo: range?.to ? toDateKey(range.to) : "",
        page: 1,
      });
    });
  }

  function handleAttachmentChange(value: string) {
    startTransition(() => {
      void setQueryState({
        hasAttachment: value as ComplaintAttachmentFilter,
        page: 1,
      });
    });
  }

  return (
    <div className="w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-65">
          <Label htmlFor="complaints-search" className="sr-only">
            Search complaints
          </Label>
          <Input
            id="complaints-search"
            placeholder="Search title, details, student, or department..."
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

        <div className="min-w-60">
          <Label htmlFor="complaints-department" className="sr-only">
            Filter by department
          </Label>
          <Select
            value={queryState.department}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger id="complaints-department" className="w-full">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.values(Department).map((department) => (
                <SelectItem key={department} value={department}>
                  {formatEnumLabel(department)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={queryState.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(ComplaintStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {formatEnumLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={queryState.category}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(ComplaintCategory).map((category) => (
              <SelectItem key={category} value={category}>
                {formatEnumLabel(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TableDateRangeFilter
          value={dateRange}
          onChange={handleDateRangeChange}
        />

        <Select
          value={queryState.hasAttachment}
          onValueChange={handleAttachmentChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Attachment" />
          </SelectTrigger>
          <SelectContent>
            {complaintAttachmentValues.map((value) => (
              <SelectItem key={value} value={value}>
                {formatEnumLabel(value)}
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
            <X className="mr-2 h-4 w-4" />
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
                      <DraggableTableHeader<AdminReportingComplaintType>
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
                  <TableRow className="group" key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell<AdminReportingComplaintType>
                          cell={cell}
                        />
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
                    No complaints found.
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
          <p aria-live="polite">
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
