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
  CalendarIcon,
  XIcon,
  EyeIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ComplaintCategory,
  ComplaintStatus,
} from "@/lib/generated/prisma/enums";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  complaintAttachmentValues,
  complaintsSearchParamsParsers,
  type ComplaintAttachmentFilter,
  type ComplaintsSortBy,
} from "../complaints-search-params";
import { ComplaintActions } from "./complaint-actions";
import { BulkDeleteComplaints } from "../actions";
import { tryCatch } from "@/hooks/tryCatch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { APP } from "@/lib/data/utils";
import { StudentComplaintsRow } from "@/app/data/student/get-complaints";
import { MiddleTruncateText } from "@/components/general/truncated-text";
import Link from "next/link";

function toDateKey(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : null;
}

function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Student complaints table with filters, sorting, and pagination.
export function ComplaintsTable({
  complaints,
  totalCount,
}: {
  /// Complaint rows to display in the table.
  complaints: StudentComplaintsRow[];
  /// Total complaints count for pagination.
  totalCount: number;
}) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();
  const [rowSelection, setRowSelection] = React.useState({});
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();

  const [queryState, setQueryState] = useQueryStates(
    complaintsSearchParamsParsers,
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
    queryState.status.length > 0 ||
    queryState.category.length > 0 ||
    queryState.dateFrom.length > 0 ||
    queryState.dateTo.length > 0 ||
    queryState.hasAttachment !== null;

  const columns = React.useMemo<ColumnDef<StudentComplaintsRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            size="sm"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            size="sm"
          />
        ),
        enableSorting: false,
      },
      {
        id: "srNo",
        header: "Sr No.",
        enableSorting: false,
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        id: "title",
        header: "Title",
        accessorFn: (row) => row.title,
        cell: ({ row }) => (
          <div className="block group font-medium">
            <MiddleTruncateText maxLength={80} text={row.original.title} />
            <Link
              href={`/student/complaints/${row.original.id}`}
              className="flex items-center mt-2 gap-1 group-hover:text-primary hover:underline underline-offset-4"
            >
              <EyeIcon className="size-4" />
              View Details
            </Link>
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
        cell: ({ row }) => (
          <Badge appearance="light" size="sm">
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        header: "Created",
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "attachment",
        header: "Attachment",
        enableSorting: false,
        cell: ({ row }) => (row.original.imageKey ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: () => <span className="block text-center">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <ComplaintActions
              complaintId={row.original.id}
              status={row.original.status}
            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: complaints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "createdAt") as ComplaintsSortBy,
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableSortingRemoval: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
    getRowId: (row) => row.id,
  });

  function handleStatusChange(value: string) {
    startTransition(() => {
      void setQueryState({
        status: value === "all" ? null : value,
        page: 1,
      });
    });
  }

  function handleCategoryChange(value: string) {
    startTransition(() => {
      void setQueryState({
        category: value === "all" ? null : value,
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

  function handleAttachmentChange(value: string) {
    startTransition(() => {
      void setQueryState({
        hasAttachment:
          value === "all" ? null : (value as ComplaintAttachmentFilter),
        page: 1,
      });
    });
  }

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  async function handleBulkDelete() {
    if (selectedCount === 0) return;

    const selectedIds = selectedRows.map((row) => row.original.id);

    setIsDeleting(true);

    const { data: response, error } = await tryCatch(
      BulkDeleteComplaints(selectedIds)
    );

    setIsDeleting(false);

    if (error || response?.status === "error") {
      toast.error(response?.message ?? "Failed to delete complaints");
      return;
    }

    toast.success(response.message);
    setRowSelection({});
    setShowDeleteDialog(false);
    router.refresh();
  }

  return (
    <>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Complaints</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} complaint
              {selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6" aria-busy={isPending}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="complaint-status">Status</Label>
              <Select
                value={queryState.status || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="complaint-status" className="w-44">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.values(ComplaintStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatEnumLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="complaint-category">Category</Label>
              <Select
                value={queryState.category || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="complaint-category" className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.values(ComplaintCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatEnumLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Created Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <span>
                          {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </span>
                      ) : (
                        <span>
                          From {format(dateRange.from, "MMM dd, yyyy")}
                        </span>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="complaint-attachment">Attachment</Label>
              <Select
                value={queryState.hasAttachment ?? "all"}
                onValueChange={handleAttachmentChange}
              >
                <SelectTrigger id="complaint-attachment" className="w-44">
                  <SelectValue placeholder="Select attachment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {complaintAttachmentValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value === "with"
                        ? "With attachment"
                        : "Without attachment"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {totalCount} result{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          {selectedCount > 0 ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {selectedCount} selected
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Selected
              </Button>
            </div>
          ) : null}
          {hasActiveParams ? (
            <Button
              variant="ghost"
              onClick={() => {
                startTransition(() => {
                  void setQueryState(null);
                });
              }}
              className="hover:underline underline-offset-4"
            >
              <XIcon className="size-4" />
              Clear
            </Button>
          ) : null}
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
                    No complaints found.
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
    </>
  );
}

function SortableTableHeader({
  header,
}: {
  header: Header<StudentComplaintsRow, unknown>;
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
                  className="shrink-0 text-primary"
                  size={16}
                  aria-hidden="true"
                />
              ),
              desc: (
                <ChevronDown
                  className="shrink-0 text-primary"
                  size={16}
                  aria-hidden="true"
                />
              ),
            }[header.column.getIsSorted() as string] ?? (
              <ChevronUp
                className="shrink-0 opacity-100 group-hover:opacity-60"
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
