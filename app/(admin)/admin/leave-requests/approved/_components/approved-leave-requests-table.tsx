/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useTransition } from "react";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from "lucide-react";
import type { GetApprovedLeaveRequestsType } from "@/app/data/admin/get-approved-leave-requests";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import { approvedLeaveRequestSearchParamsParsers } from "../approved-leave-request-search-params";
import { UserImage } from "@/components/user/user-image";
import { APP } from "@/lib/data/utils";
import { TableDateRangeFilter } from "@/components/general/table-date-range-filter";
import { MarkAsLeaveDialog } from "./mark-as-leave-dialog";
import { AttendanceStatusBadge } from "./attendance-status-badge";

export function AdminApprovedLeaveRequestsTable({
  requests,
  totalCount,
}: {
  requests: GetApprovedLeaveRequestsType[];
  totalCount: number;
}) {
  "use no memo";
  const [isPending, startTransition] = useTransition();
  const [queryState, setQueryState] = useQueryStates(
    approvedLeaveRequestSearchParamsParsers,
    {
      history: "replace",
      shallow: false,
    }
  );

  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  const sorting: SortingState = queryState.sortBy
    ? [{ id: queryState.sortBy, desc: queryState.sortDir === "desc" }]
    : [];

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "createdAt" ||
    queryState.sortDir !== "desc" ||
    queryState.query.length > 0 ||
    queryState.startDate !== null ||
    queryState.endDate !== null;

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const columns: ColumnDef<GetApprovedLeaveRequestsType>[] = [
    {
      id: "student",
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
      id: "date",
      header: "Leave Date",
      accessorFn: (row) => row.date,
      cell: ({ row }) => <div>{formatDate(row.original.date)}</div>,
    },
    {
      id: "reason",
      header: "Reason",
      accessorFn: (row) => row.reasonTitle,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="max-w-[30ch] truncate text-sm">
          {row.original.reasonTitle}
        </div>
      ),
    },
    {
      id: "attendanceStatus",
      header: "Attendance Status",
      enableSorting: false,
      cell: ({ row }) => (
        <AttendanceStatusBadge status={row.original.attendanceStatus} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const canMarkAsLeave =
          row.original.attendanceStatus === "ABSENT" &&
          Boolean(row.original.attendanceRecordId);

        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal aria-label="More Actions" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!canMarkAsLeave}
                  onSelect={(event) => {
                    if (!canMarkAsLeave) {
                      return;
                    }

                    event.preventDefault();
                    setDialogOpen(row.original.id);
                  }}
                >
                  Mark as Leave
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
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
      pagination,
    },
    enableSortingRemoval: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
  });

  return (
    <>
      <div className="max-w-full" aria-busy={isPending}>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <Label htmlFor="approved-lr-search" className="sr-only">
              Search approved leave requests
            </Label>
            <Input
              id="approved-lr-search"
              className="max-w-62.5"
              placeholder="Search by student, subject, or reason"
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
            <TableDateRangeFilter
              value={{
                from: queryState.startDate
                  ? new Date(queryState.startDate)
                  : undefined,
                to: queryState.endDate
                  ? new Date(queryState.endDate)
                  : undefined,
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

          <div>
            <Label htmlFor="page-size" className="sr-only">
              Rows per page
            </Label>
            <Select
              value={queryState.pageSize.toString()}
              onValueChange={(value) => {
                startTransition(() => {
                  void setQueryState({
                    pageSize: parseInt(value),
                    page: 1,
                  });
                });
              }}
            >
              <SelectTrigger id="page-size" className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Rows per page" />
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

        {/* Table */}
        <div className="rounded-md border my-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/50 [&>th]:border-t-0"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={
                            header.column.getCanSort()
                              ? "flex items-center gap-2 cursor-pointer select-none hover:text-foreground"
                              : ""
                          }
                          disabled={!header.column.getCanSort()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="ml-1 text-xs">
                              {
                                {
                                  asc: "↑",
                                  desc: "↓",
                                }[header.column.getIsSorted() as string]
                              }
                            </span>
                          )}
                        </button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                    No approved leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
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

      {/* Mark as Leave Dialog */}
      {dialogOpen && (
        <MarkAsLeaveDialog
          open={true}
          onOpenChange={(open) => !open && setDialogOpen(null)}
          studentId={requests.find((r) => r.id === dialogOpen)?.studentId || ""}
          studentName={
            requests.find((r) => r.id === dialogOpen)?.student.user.name || ""
          }
          attendanceRecordId={
            requests.find((r) => r.id === dialogOpen)?.attendanceRecordId || ""
          }
        />
      )}
    </>
  );
}
