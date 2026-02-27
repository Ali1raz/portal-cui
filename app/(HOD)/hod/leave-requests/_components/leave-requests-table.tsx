/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useId, useState, useTransition, type CSSProperties } from "react";
import type {
  Cell,
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripVertical,
  X,
} from "lucide-react";
import type { GetLeaveRequestsType } from "@/app/data/hod/get-leave-requests";
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
import { cn, formatDate } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  LeaveRequestStatus,
  leaveRequestSearchParamsParsers,
  leaveRequestStatusValues,
} from "../leave-request-search-params";
import { UserImage } from "@/components/user/user-image";
import { RequestActions } from "./request-actions";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { APP } from "@/lib/data/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { LeaveRequestBulkActions } from "./leave-request-bulk-actions";

export function LeaveRequestsTable({
  requests,
  totalCount,
}: {
  requests: GetLeaveRequestsType[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  const [rowSelection, setRowSelection] = useState({});
  const [queryState, setQueryState] = useQueryStates(
    leaveRequestSearchParamsParsers,
    {
      history: "replace",
      shallow: false,
      limitUrlUpdates: {
        method: "throttle",
        timeMs: 1000,
      },
    }
  );

  const sorting: SortingState = queryState.sortBy
    ? [{ id: queryState.sortBy, desc: queryState.sortDir === "desc" }]
    : [];

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== 10 ||
    queryState.sortBy !== "createdAt" ||
    queryState.sortDir !== "desc" ||
    queryState.query.length > 0 ||
    queryState.status !== null ||
    queryState.startDate !== null ||
    queryState.endDate !== null;

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const columns: ColumnDef<GetLeaveRequestsType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
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
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      id: "srNo",
      header: "Sr No.",
      enableSorting: false,
      cell: ({ row }) => (
        <div>{pagination.pageIndex * pagination.pageSize + row.index + 1}</div>
      ),
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
      enableSorting: false,
      cell: ({ row }) => (
        <div className="max-w-[30ch] truncate">{row.original.reasonTitle}</div>
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
  ];

  const [columnOrder, setColumnOrder] = useState<string[]>(
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

  return (
    <div className="max-w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <Label htmlFor="leave-request-search" className="sr-only">
            Search leave requests
          </Label>
          <Input
            id="leave-request-search"
            className="max-w-[250px]"
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
        <Select
          value={queryState.status ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                status: value === "all" ? null : (value as LeaveRequestStatus),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {leaveRequestStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start w-[280px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {queryState.startDate && queryState.endDate ? (
                  <span>
                    {format(new Date(queryState.startDate), "MMM dd, yyyy")} -{" "}
                    {format(new Date(queryState.endDate), "MMM dd, yyyy")}
                  </span>
                ) : queryState.startDate ? (
                  <span>
                    From{" "}
                    {format(new Date(queryState.startDate), "MMM dd, yyyy")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Pick date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                numberOfMonths={1}
                selected={{
                  from: queryState.startDate
                    ? new Date(queryState.startDate)
                    : undefined,
                  to: queryState.endDate
                    ? new Date(queryState.endDate)
                    : undefined,
                }}
                onSelect={(range) => {
                  startTransition(() => {
                    void setQueryState({
                      startDate: range?.from ?? null,
                      endDate: range?.to ?? null,
                      page: 1,
                    });
                  });
                }}
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
            <X className="size-4 mr-1" />
            Clear
          </Button>
        ) : null}
      </div>
      <div className="my-2 md:my-4">
        {Object.keys(rowSelection).length > 0 ? (
          <LeaveRequestBulkActions
            selectedIds={table
              .getSelectedRowModel()
              .rows.map((row) => row.original.id)}
            requests={table
              .getSelectedRowModel()
              .rows.map((row) => row.original)}
            onSuccess={() => {
              setRowSelection({});
            }}
          />
        ) : null}
      </div>

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
                      <DraggableTableHeader key={header.id} header={header} />
                    ))}
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
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell cell={cell} />
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

function DraggableTableHeader({
  header,
}: {
  header: Header<GetLeaveRequestsType, unknown>;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: header.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableHead
      ref={setNodeRef}
      className="before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:left-0 before:w-px first:before:bg-transparent"
      style={style}
      aria-sort={
        header.column.getIsSorted() === "asc"
          ? "ascending"
          : header.column.getIsSorted() === "desc"
            ? "descending"
            : "none"
      }
    >
      <div className="flex items-center justify-start gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          className="-ml-2 size-7"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical
            className={cn(
              "opacity-60 cursor-grab",
              isDragging && " cursor-grabbing"
            )}
            aria-hidden="true"
          />
        </Button>
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
              if (
                header.column.getCanSort() &&
                (event.key === "Enter" || event.key === " ")
              ) {
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

function DragAlongCell({
  cell,
}: {
  cell: Cell<GetLeaveRequestsType, unknown>;
}) {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell ref={setNodeRef} className="truncate" style={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}
