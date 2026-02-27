/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  useId,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
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
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  CalendarIcon,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { ProfessorGetLeaveRequests } from "@/app/data/professor/get-leave-requests";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { cn, formatDate } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  leaveRequestsSearchParamsParsers,
  type LeaveRequestsSortBy,
} from "../leave-requests-search-params";
import { UserImage } from "@/components/user/user-image";
import { MiddleTruncateText } from "@/components/general/truncated-text";
import { ProfessorLeaveRequestDropdown } from "./leave-requst-actions-dropdown";
import { APP } from "@/lib/data/utils";

/// Props for professor leave requests table.
type ProfessorLeaveRequestsTableProps = {
  requests: ProfessorGetLeaveRequests[];
  totalCount: number;
  offeringId: string;
};

const statusOptions = Object.values(LeaveStatus);

function toDateKey(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : null;
}

function parseDateKey(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/// Table for professor leave requests with filters, sorting, and pagination.
export function ProfessorLeaveRequestsTable({
  requests,
  totalCount,
  offeringId,
}: ProfessorLeaveRequestsTableProps) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "student",
    "registrationNo",
    "title",
    "date",
    "createdAt",
    "status",
  ]);

  /// URL-synced sorting, pagination, and filters using nuqs.
  const [queryState, setQueryState] = useQueryStates(
    leaveRequestsSearchParamsParsers,
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

  const selectedStatuses = useMemo(() => {
    if (!queryState.status) return [] as LeaveStatus[];
    return queryState.status
      .split(",")
      .map((status) => status.trim())
      .filter(Boolean) as LeaveStatus[];
  }, [queryState.status]);

  const leaveDateRange = useMemo<DateRange>(() => {
    return {
      from: parseDateKey(queryState.dateFrom),
      to: parseDateKey(queryState.dateTo),
    };
  }, [queryState.dateFrom, queryState.dateTo]);

  const createdDateRange = useMemo<DateRange>(() => {
    return {
      from: parseDateKey(queryState.createdFrom),
      to: parseDateKey(queryState.createdTo),
    };
  }, [queryState.createdFrom, queryState.createdTo]);

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== 10 ||
    queryState.sortBy !== "createdAt" ||
    queryState.sortDir !== "desc" ||
    queryState.query.length > 0 ||
    queryState.status.length > 0 ||
    queryState.dateFrom.length > 0 ||
    queryState.dateTo.length > 0 ||
    queryState.createdFrom.length > 0 ||
    queryState.createdTo.length > 0;

  const columns: ColumnDef<ProfessorGetLeaveRequests>[] = [
    {
      id: "registrationNo",
      header: "Registration No",
      accessorFn: (row) => row.student.registrationNo,
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.student.registrationNo}
        </span>
      ),
    },
    {
      id: "student",
      header: "Student",
      accessorFn: (row) => row.student.user.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserImage
            name={row.original.student.user.name}
            image={row.original.student.user.image}
          />
          <div className="flex flex-col">
            <span className="font-bold">{row.original.student.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.student.department}
            </span>
          </div>
        </div>
      ),
      sortUndefined: "last",
      sortDescFirst: false,
    },
    {
      id: "title",
      header: "Reason",
      accessorFn: (row) => row.reasonTitle,
      cell: ({ row }) => <MiddleTruncateText text={row.original.reasonTitle} />,
    },
    {
      id: "date",
      header: "Leave Date",
      accessorFn: (row) => row.date,
      cell: ({ row }) =>
        row.original.date ? formatDate(row.original.date) : "-",
    },
    {
      id: "createdAt",
      header: "Created",
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
            row.original.status === "PENDING"
              ? "secondary"
              : row.original.status === "APPROVED"
                ? "success"
                : "destructive"
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
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <div className="text-center">
          <ProfessorLeaveRequestDropdown
            requestId={row.original.id}
            offeringId={offeringId}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "createdAt") as LeaveRequestsSortBy,
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

  function handleStatusChange(values: string[]) {
    startTransition(() => {
      void setQueryState({
        status: values.length ? values.join(",") : null,
        page: 1,
      });
    });
  }

  function handleRangeChange(
    range: DateRange | undefined,
    keys: { from: "dateFrom" | "createdFrom"; to: "dateTo" | "createdTo" }
  ) {
    startTransition(() => {
      void setQueryState({
        [keys.from]: range?.from ? toDateKey(range.from) : null,
        [keys.to]: range?.to ? toDateKey(range.to) : null,
        page: 1,
      });
    });
  }

  return (
    <div className="w-full space-y-4" aria-busy={isPending}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full max-w-md">
            <Label htmlFor="leave-search" className="sr-only">
              Search by student name or registration number
            </Label>
            <Input
              id="leave-search"
              placeholder="Search by student name or registration no"
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
              Clear
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={selectedStatuses}
              onValueChange={handleStatusChange}
              spacing={1}
            >
              {statusOptions.map((status) => (
                <ToggleGroupItem key={status} value={status}>
                  {status}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Leave Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {leaveDateRange.from ? (
                    leaveDateRange.to ? (
                      <span>
                        {format(leaveDateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(leaveDateRange.to, "MMM dd, yyyy")}
                      </span>
                    ) : (
                      <span>
                        From {format(leaveDateRange.from, "MMM dd, yyyy")}
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
                  selected={leaveDateRange}
                  onSelect={(range) =>
                    handleRangeChange(range, {
                      from: "dateFrom",
                      to: "dateTo",
                    })
                  }
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Created At</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {createdDateRange.from ? (
                    createdDateRange.to ? (
                      <span>
                        {format(createdDateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(createdDateRange.to, "MMM dd, yyyy")}
                      </span>
                    ) : (
                      <span>
                        From {format(createdDateRange.from, "MMM dd, yyyy")}
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
                  selected={createdDateRange}
                  onSelect={(range) =>
                    handleRangeChange(range, {
                      from: "createdFrom",
                      to: "createdTo",
                    })
                  }
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
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
                  <TableRow key={row.id}>
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
  header: Header<ProfessorGetLeaveRequests, unknown>;
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
              isDragging && "cursor-grabbing"
            )}
            aria-hidden="true"
          />
        </Button>
        <span className="grow truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
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
          {header.column.getCanSort()
            ? ({
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
              ))
            : null}
        </Button>
      </div>
    </TableHead>
  );
}

function DragAlongCell({
  cell,
}: {
  cell: import("@tanstack/react-table").Cell<
    ProfessorGetLeaveRequests,
    unknown
  >;
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
