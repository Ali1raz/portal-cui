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
  Clock,
  GripVertical,
} from "lucide-react";
import type { AdminGetOfferingsType } from "@/app/data/admin/get-offerings";
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
import { AdminOfferingActions } from "./admin-offeringActions";
import { cn } from "@/lib/utils";
import { useQueryStates } from "nuqs";
import {
  OfferingDepartment,
  offeringDepartmentValues,
  offeringSearchParamsParsers,
} from "../offering-search-params";
import Link from "next/link";
import { UserImage } from "@/components/user/user-image";
import { APP } from "@/lib/data/utils";

export function OfferingsTable({
  offerings,
  totalCount,
}: {
  offerings: AdminGetOfferingsType[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  const [queryState, setQueryState] = useQueryStates(
    offeringSearchParamsParsers,
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
    queryState.sortBy !== "semester" ||
    queryState.sortDir !== "asc" ||
    queryState.query.length > 0 ||
    queryState.department !== null ||
    queryState.semester !== null ||
    queryState.year !== null ||
    queryState.teacher.length > 0;

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const columns: ColumnDef<AdminGetOfferingsType>[] = [
    {
      id: "srNo",
      header: "Sr No.",
      enableSorting: false,
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      id: "semester",
      header: "Semester",
      accessorFn: (row) => row.semester,
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <span>Semester: {row.original.semester}</span>
          <span>Year: {row.original.year}</span>
        </div>
      ),
      sortUndefined: "last",
      sortDescFirst: false,
    },
    {
      id: "department",
      header: "Department",
      accessorFn: (row) => row.department,
      cell: ({ row }) => (
        <div className="text-center">{row.original.department}</div>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      accessorFn: ({ subject }) => subject.name,
      cell: ({ row }) => (
        <div className="flex flex-col gap-2 ">
          <Link
            href={`/admin/subjects/${row.original.subject.id}`}
            className="hover:text-primary hover:underline underline-offset-4"
          >
            <span>{row.original.subject.name}</span>
          </Link>
          <span>{row.original.subject.code}</span>
          <span>Credit hrs: {row.original.subject.creditHours}</span>
        </div>
      ),
    },
    {
      id: "totalLectures",
      header: "Total Lectures",
      accessorFn: (row) => row.totalLectures,
      cell: ({ row }) => (
        <div className="text-center">{row.original.totalLectures}</div>
      ),
    },
    {
      id: "enrollments",
      header: "Enrollments",
      accessorFn: (row) => row._count.enrollments,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original._count.enrollments === 0
            ? "-"
            : row.original._count.enrollments}
        </div>
      ),
    },
    {
      id: "teachings",
      header: "Teacher Assigned",
      accessorFn: (row) => row._count.teachingAssignments,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original._count.teachingAssignments === 0 ? (
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Clock className="size-4" />
              <span className="text-xs">Not assigned</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {row.original.teachingAssignments.map((assignment, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <UserImage
                    image={assignment.professor.user.image}
                    name={assignment.professor.user.name}
                    className="size-8"
                  />
                  <span className="text-sm">
                    {assignment.professor.user.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <AdminOfferingActions offeringId={row.original.id} />
        </div>
      ),
    },
  ];

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data: offerings,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "semester") as typeof queryState.sortBy,
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

  const semesterOptions = Array.from({ length: 8 }, (_, index) => index + 1);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 8 },
    (_, index) => currentYear - 3 + index
  );

  return (
    <div className="max-w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <Label htmlFor="offering-search" className="sr-only">
            Search offerings
          </Label>
          <Input
            id="offering-search"
            className="max-w-[200px]"
            placeholder="Search by subject name or code"
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
          <Label htmlFor="teacher-search" className="sr-only">
            Search by teacher name
          </Label>
          <Input
            id="teacher-search"
            className="max-w-[200px]"
            placeholder="Filter by teacher name"
            value={queryState.teacher}
            onChange={(event) => {
              const nextValue = event.target.value;

              startTransition(() => {
                void setQueryState({
                  teacher: nextValue.trim().length > 0 ? nextValue : "",
                  page: 1,
                });
              });
            }}
          />
        </div>
        <Select
          value={queryState.department ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                department:
                  value === "all" ? null : (value as OfferingDepartment),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {offeringDepartmentValues.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={queryState.semester?.toString() ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                semester: value === "all" ? null : Number(value),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesterOptions.map((semester) => (
              <SelectItem key={semester} value={semester.toString()}>
                {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={queryState.year?.toString() ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                year: value === "all" ? null : Number(value),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                    No offerings found.
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
  header: Header<AdminGetOfferingsType, unknown>;
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
      </div>
    </TableHead>
  );
}

function DragAlongCell({
  cell,
}: {
  cell: Cell<AdminGetOfferingsType, unknown>;
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
