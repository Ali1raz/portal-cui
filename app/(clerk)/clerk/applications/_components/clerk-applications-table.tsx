/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useId, useState, useTransition } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useQueryStates } from "nuqs";
import { Department } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/utils";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";
import { TableDateRangeFilter } from "@/components/general/table-date-range-filter";
import {
  clerkApplicationsSearchParamsParsers,
  clerkApplicationsStatusValues,
  type ClerkApplicationsSortBy,
  type ClerkApplicationsStatus,
} from "../clerk-applications-search-params";
import { APP } from "@/lib/data/utils";
import { ClerkApplicationListItem } from "@/app/data/clerk/get-clerk-applications";
import { ClerkApplicationActions } from "./clerk-application-actions";
import { ClerkApplicationsBulkActions } from "./clerk-applications-bulk-actions";

function toDateKey(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : "";
}

function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function ClerkApplicationsTable({
  applications,
  totalCount,
}: {
  applications: ClerkApplicationListItem[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "select",
    "fullName",
    "submittedAt",
    "preferredDepartment",
    "status",
    "actions",
  ]);

  const [queryState, setQueryState] = useQueryStates(
    clerkApplicationsSearchParamsParsers,
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

  const submittedDateRange = {
    from: parseDateKey(queryState.submittedFrom),
    to: parseDateKey(queryState.submittedTo),
  } satisfies DateRange;

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "submittedAt" ||
    queryState.sortDir !== "desc" ||
    queryState.query.length > 0 ||
    queryState.status !== null ||
    queryState.department !== null ||
    queryState.submittedFrom.length > 0 ||
    queryState.submittedTo.length > 0;

  const columns: ColumnDef<ClerkApplicationListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          size="sm"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="sm"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      id: "submittedAt",
      header: "Submitted At",
      accessorFn: (row) => row.submittedAt ?? row.createdAt,
      cell: ({ row }) =>
        formatDate(row.original.submittedAt ?? row.original.createdAt),
      sortUndefined: "last",
    },
    {
      id: "preferredDepartment",
      header: "Department",
      accessorFn: (row) => row.preferredDepartment,
      cell: ({ row }) => row.original.preferredDepartment,
      sortUndefined: "last",
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "PENDING"
              ? "secondary"
              : row.original.status === "APPROVED"
                ? "success"
                : row.original.status === "REJECTED"
                  ? "destructive"
                  : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
      sortUndefined: "last",
    },

    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <ClerkApplicationActions applicationId={row.original.id} />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "submittedAt") as ClerkApplicationsSortBy,
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
      rowSelection,
    },
    onColumnOrderChange: setColumnOrder,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedStatuses = new Set(
    selectedRows.map((row) => row.original.status)
  );
  const hasUniformSelectedStatus = selectedStatuses.size === 1;
  const currentSelectedStatus = hasUniformSelectedStatus
    ? Array.from(selectedStatuses)[0]
    : undefined;

  return (
    <div className="w-full space-y-4" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <Label htmlFor="clerk-applications-search" className="sr-only">
            Search applications
          </Label>
          <Input
            id="clerk-applications-search"
            placeholder="Search by applicant name"
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

        <div>
          <Label htmlFor="clerk-applications-status" className="sr-only">
            Filter by status
          </Label>
          <Select
            value={queryState.status ?? "all"}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  status:
                    value === "all" ? null : (value as ClerkApplicationsStatus),
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger id="clerk-applications-status" className="w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {clerkApplicationsStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="clerk-applications-department" className="sr-only">
            Filter by department
          </Label>
          <Select
            value={queryState.department ?? "all"}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  department: value === "all" ? null : (value as Department),
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger id="clerk-applications-department" className="w-44">
              <SelectValue placeholder="Filter department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {Object.values(Department).map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TableDateRangeFilter
          value={submittedDateRange}
          placeholder="Submitted date range"
          calendarProps={{
            autoFocus: true,
            numberOfMonths: 1,
          }}
          onChange={(range) => {
            startTransition(() => {
              void setQueryState({
                submittedFrom: range?.from ? toDateKey(range.from) : "",
                submittedTo: range?.to ? toDateKey(range.to) : "",
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
          <XIcon className="size-4" />
          Clear
        </Button>
      ) : null}

      {selectedRows.length > 0 &&
      hasUniformSelectedStatus &&
      currentSelectedStatus ? (
        <ClerkApplicationsBulkActions
          selectedIds={selectedRows.map((row) => row.original.id)}
          currentStatus={currentSelectedStatus}
          onSuccess={() => {
            setRowSelection({});
          }}
        />
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
                    {headerGroup.headers.map((header) =>
                      header.column.id === "select" ? (
                        <TableHead
                          key={header.id}
                          className="before:bg-border group relative h-10 border-t before:absolute before:inset-y-0 before:left-0 before:w-px first:before:bg-transparent"
                          style={{ width: header.column.getSize() }}
                        >
                          <div className="flex items-center justify-start gap-0.5">
                            <span className="grow truncate">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </span>
                          </div>
                        </TableHead>
                      ) : (
                        <DraggableTableHeader<ClerkApplicationListItem>
                          key={header.id}
                          header={header}
                        />
                      )
                    )}
                  </SortableContext>
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
                    {row.getVisibleCells().map((cell) =>
                      cell.column.id === "select" ? (
                        <TableCell
                          key={cell.id}
                          className="truncate"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ) : (
                        <SortableContext
                          key={cell.id}
                          items={columnOrder}
                          strategy={horizontalListSortingStrategy}
                        >
                          <DragAlongCell<ClerkApplicationListItem>
                            cell={cell}
                          />
                        </SortableContext>
                      )
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <div className="flex items-center justify-between gap-8 mt-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="clerk-applications-page-size">Rows per page</Label>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  pageSize: Number(value),
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger id="clerk-applications-page-size" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP.page_sizes.map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="First page"
              >
                <ChevronFirst size={16} />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm text-muted-foreground px-2">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Last page"
              >
                <ChevronLast size={16} />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
