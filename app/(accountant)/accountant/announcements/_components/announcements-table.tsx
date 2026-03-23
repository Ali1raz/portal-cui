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
  ArrowUpRightFromSquare,
  CalendarIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AnnouncementStatus,
  AnnouncementType,
} from "@/lib/generated/prisma/enums";
import { cn, formatDate, formatEnumLabel } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  announcementAttachmentValues,
  announcementPinnedValues,
  accountantAnnouncementsSearchParamsParsers,
  type AnnouncementAttachmentFilter,
  type AnnouncementPinnedFilter,
  type AnnouncementSortBy,
} from "../announcements-search-params";
import type { AccountantAnnouncementRow } from "@/app/data/accountant/get-announcements";
import { AccountantAnnouncementDetailsDrawer } from "./accountant-announcement-details-drawer";
import { MiddleTruncateText } from "@/components/general/truncated-text";
import { AccountantAnnouncementActions } from "./accountant-announcements-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountantAnnouncementsBulkActions } from "./accountant-announcements-bulk-actions";
import { APP } from "@/lib/data/utils";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";

export const statusVariantMap: Record<
  AnnouncementStatus,
  "warning" | "info" | "success" | "destructive" | "secondary"
> = {
  DRAFT: "secondary",
  SCHEDULED: "info",
  PUBLISHED: "success",
  ARCHIVED: "destructive",
};

function toDateKey(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : "";
}

function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Accountant announcements table with filters, sorting, pagination, and DND.
export function AccountantAnnouncementsTable({
  announcements,
  totalCount,
}: {
  /// Announcement rows to display.
  announcements: AccountantAnnouncementRow[];
  /// Total announcements count for pagination.
  totalCount: number;
}) {
  "use no memo";
  const tableId = React.useId();
  const [isPending, startTransition] = React.useTransition();
  const [rowSelection, setRowSelection] = React.useState({});

  const [queryState, setQueryState] = useQueryStates(
    accountantAnnouncementsSearchParamsParsers,
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
    queryState.type.length > 0 ||
    queryState.dateFrom.length > 0 ||
    queryState.dateTo.length > 0 ||
    queryState.pinned !== "all" ||
    queryState.hasAttachment !== "all" ||
    queryState.query.length > 0;

  const columns = React.useMemo<ColumnDef<AccountantAnnouncementRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const isAllSelected = table.getIsAllPageRowsSelected();
          const isSomeSelected = table.getIsSomePageRowsSelected();
          const toggleHandler = table.getToggleAllPageRowsSelectedHandler();
          return (
            <div className="flex items-center gap-2 me-2">
              <Checkbox
                size="sm"
                aria-label="Select all"
                checked={
                  isAllSelected
                    ? true
                    : isSomeSelected && !isAllSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(value) => {
                  const syntheticEvent = {
                    target: { checked: !!value },
                  } as unknown as React.ChangeEvent<HTMLInputElement>;
                  toggleHandler(syntheticEvent);
                }}
              />
              <span className="text-muted-foreground text-sm">Sr. No</span>
            </div>
          );
        },
        cell: ({ row }) => {
          const toggleHandler = row.getToggleSelectedHandler();
          return (
            <div className="flex items-center gap-2">
              <Checkbox
                size="sm"
                aria-label="Select row"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onCheckedChange={(value) => {
                  const syntheticEvent = {
                    target: { checked: !!value },
                  } as unknown as React.ChangeEvent<HTMLInputElement>;
                  toggleHandler(syntheticEvent);
                }}
              />
              <span className="text-muted-foreground text-sm">
                {row.index + 1}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "title",
        header: "Announcement",
        accessorFn: (row) => row.title,
        cell: ({ row }) => (
          <div className="flex max-w-[320px] flex-col gap-1">
            <MiddleTruncateText text={row.original.title} maxLength={30} />
            <AccountantAnnouncementDetailsDrawer announcement={row.original}>
              <span className="hover:text-primary cursor-pointer flex items-center gap-2 w-min">
                view
                <ArrowUpRightFromSquare className="size-4" />
              </span>
            </AccountantAnnouncementDetailsDrawer>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        accessorFn: (row) => row.type,
        cell: ({ row }) => (
          <Badge variant="info" appearance="light" size="sm">
            {formatEnumLabel(row.original.type)}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <Badge
            variant={statusVariantMap[row.original.status]}
            appearance="light"
            size="sm"
          >
            {formatEnumLabel(row.original.status)}
          </Badge>
        ),
      },

      {
        id: "isPinned",
        header: "Pinned",
        accessorFn: (row) => row.isPinned,
        cell: ({ row }) => (row.original.isPinned ? "Yes" : "No"),
      },
      {
        id: "attachment",
        header: "Attachment",
        enableSorting: false,
        cell: ({ row }) => (row.original.imageKey ? "Yes" : "No"),
      },
      {
        id: "scheduledFor",
        header: "Scheduled",
        accessorFn: (row) => row.scheduledFor,
        cell: ({ row }) =>
          row.original.scheduledFor
            ? formatDate(row.original.scheduledFor)
            : "-",
      },
      {
        id: "createdAt",
        header: "Created",
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: () => <span className="block text-center">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <AccountantAnnouncementActions announcementId={row.original.id} />
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
    data: announcements,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "createdAt") as AnnouncementSortBy,
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
    enableSortingRemoval: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
    getRowId: (row) => row.id,
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
        status: value === "all" ? "" : value,
        page: 1,
      });
    });
  }

  function handleTypeChange(value: string) {
    startTransition(() => {
      void setQueryState({
        type: value === "all" ? "" : value,
        page: 1,
      });
    });
  }

  function handleDateRangeChange(range: DateRange | undefined) {
    startTransition(() => {
      void setQueryState({
        dateFrom: range?.from ? toDateKey(range.from) : "",
        dateTo: range?.to ? toDateKey(range.to) : "",
        page: 1,
      });
    });
  }

  function handlePinnedChange(value: string) {
    startTransition(() => {
      void setQueryState({
        pinned: value as AnnouncementPinnedFilter,
        page: 1,
      });
    });
  }

  function handleAttachmentChange(value: string) {
    startTransition(() => {
      void setQueryState({
        hasAttachment: value as AnnouncementAttachmentFilter,
        page: 1,
      });
    });
  }

  return (
    <div className="w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="announcements-search" className="sr-only">
            Search announcements
          </Label>
          <Input
            id="announcements-search"
            placeholder="Search by title or content..."
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
          value={queryState.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(AnnouncementStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {formatEnumLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={queryState.type || "all"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(AnnouncementType).map((type) => (
              <SelectItem key={type} value={type}>
                {formatEnumLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={queryState.pinned} onValueChange={handlePinnedChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pinned" />
          </SelectTrigger>
          <SelectContent>
            {announcementPinnedValues.map((value) => (
              <SelectItem key={value} value={value}>
                {formatEnumLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={queryState.hasAttachment}
          onValueChange={handleAttachmentChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Attachment" />
          </SelectTrigger>
          <SelectContent>
            {announcementAttachmentValues.map((value) => (
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
            <XIcon className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      ) : null}

      {Object.keys(rowSelection).length > 0 ? (
        <div className="mb-4">
          <AccountantAnnouncementsBulkActions
            selectedIds={Object.keys(rowSelection)}
            announcements={announcements.filter((a) =>
              Object.keys(rowSelection).includes(a.id)
            )}
            onSuccess={() => setRowSelection({})}
          />
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
                      <DraggableTableHeader<AccountantAnnouncementRow>
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
                        <DragAlongCell<AccountantAnnouncementRow> cell={cell} />
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
                    No announcements found.
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
