/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useId, useState, useTransition } from "react";
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
  type DragEndEvent,
  useSensor,
  useSensors,
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

import type {
  AdminLeaveRequestSemesterOption,
  AdminReportingLeaveRequestsType,
} from "@/app/data/admin/get-reporting-leave-requests";
import { APP } from "@/lib/data/utils";
import { formatDate } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  reportingLeaveRequestSearchParamsParsers,
  reportingLeaveRequestStatusValues,
} from "../reporting-leave-request-search-params";
import { UserImage } from "@/components/user/user-image";
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
import { TableDateRangeFilter } from "@/components/general/table-date-range-filter";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";

function formatSemesterLabel(semester: AdminLeaveRequestSemesterOption) {
  return `Sem ${semester.semester}-${semester.batch}${String(semester.year).slice(-2)}-${semester.program ?? ""}${semester.department}`;
}

export function ReportingLeaveRequestsTable({
  requests,
  totalCount,
  semesters,
}: {
  requests: AdminReportingLeaveRequestsType[];
  totalCount: number;
  semesters: AdminLeaveRequestSemesterOption[];
}) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "studentName",
    "department",
    "subject",
    "reasonTitle",
    "date",
    "createdAt",
    "status",
  ]);

  const [queryState, setQueryState] = useQueryStates(
    reportingLeaveRequestSearchParamsParsers,
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
    queryState.query.length > 0 ||
    queryState.studentName.length > 0 ||
    queryState.requestNo.length > 0 ||
    queryState.semesterId !== null ||
    queryState.status !== null ||
    queryState.startDate !== null ||
    queryState.endDate !== null;

  const columns: ColumnDef<AdminReportingLeaveRequestsType>[] = [
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
      header: "Dep",
      accessorFn: (row) => row.offering.department,
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {row.original.offering.department}
        </div>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      accessorFn: (row) => row.offering.subject.name,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span>{row.original.offering.subject.name}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {row.original.offering.subject.code}
          </span>
        </div>
      ),
    },
    {
      id: "reasonTitle",
      header: "Reason",
      accessorFn: (row) => row.reasonTitle,
      cell: ({ row }) => (
        <div className="max-w-[32ch] truncate">{row.original.reasonTitle}</div>
      ),
    },
    {
      id: "date",
      header: "Leave Date",
      accessorFn: (row) => row.date,
      cell: ({ row }) => <div>{formatDate(row.original.date)}</div>,
    },
    {
      id: "createdAt",
      header: "Requested On",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
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
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

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
          sortBy: (next?.id ?? "createdAt") as typeof queryState.sortBy,
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
    <div className="max-w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lr-search" className="sr-only">
            Search leave requests
          </Label>
          <Input
            id="lr-search"
            className="max-w-72"
            placeholder="Search by subject, reason, or reg no"
            value={queryState.query}
            onChange={(event) => {
              const nextValue = event.target.value;

              startTransition(() => {
                void setQueryState({
                  query: nextValue.trim().length > 0 ? nextValue : null,
                  page: 1,
                });
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lr-student-name" className="sr-only">
            Search student name
          </Label>
          <Input
            id="lr-student-name"
            className="max-w-60"
            placeholder="Filter by student name"
            value={queryState.studentName}
            onChange={(event) => {
              const nextValue = event.target.value;

              startTransition(() => {
                void setQueryState({
                  studentName: nextValue.trim().length > 0 ? nextValue : null,
                  page: 1,
                });
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lr-request-no" className="sr-only">
            Search request no
          </Label>
          <Input
            id="lr-request-no"
            className="max-w-44"
            placeholder="Request no"
            value={queryState.requestNo}
            onChange={(event) => {
              const nextValue = event.target.value;

              startTransition(() => {
                void setQueryState({
                  requestNo: nextValue.trim().length > 0 ? nextValue : null,
                  page: 1,
                });
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lr-semester" className="sr-only">
            Semester
          </Label>
          <Select
            value={queryState.semesterId ?? "all"}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  semesterId: value === "all" ? null : value,
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger id="lr-semester" className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {formatSemesterLabel(semester)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lr-status" className="sr-only">
            Status
          </Label>
          <Select
            value={queryState.status ?? "all"}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  status:
                    value === "all"
                      ? null
                      : (value as (typeof reportingLeaveRequestStatusValues)[number]),
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger id="lr-status" className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {reportingLeaveRequestStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.split("_").join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <TableDateRangeFilter
            value={{
              from: queryState.startDate
                ? new Date(queryState.startDate)
                : undefined,
              to: queryState.endDate ? new Date(queryState.endDate) : undefined,
            }}
            className="w-70"
            placeholder="Pick date range"
            calendarProps={{ numberOfMonths: 1 }}
            onChange={(range) => {
              startTransition(() => {
                void setQueryState({
                  startDate: range?.from ?? null,
                  endDate: range?.to ?? null,
                  page: 1,
                });
              });
            }}
          />
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
            <X className="size-4" />
            Clear
          </Button>
        ) : null}

        <div className="my-4 rounded-md border w-full">
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
                        <DraggableTableHeader<AdminReportingLeaveRequestsType>
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
                          <DragAlongCell<AdminReportingLeaveRequestsType>
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
                      No leave requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex flex-wrap items-center w-full justify-between gap-4 py-4">
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
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  totalCount
                )}
              </span>{" "}
              of <span className="text-foreground">{totalCount}</span>
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
    </div>
  );
}
