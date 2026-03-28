/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useId, useState, useTransition, useEffect } from "react";
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
import type { AdminSemester } from "@/app/data/admin/get-semesters";
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
import { formatDate } from "@/lib/utils";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";
import { useQueryStates } from "nuqs";
import {
  semesterBatchValues,
  SemesterBatch,
  SemesterDepartment,
  semesterDepartmentValues,
  semesterSearchParamsParsers,
  semesterStatusValues,
  SemesterStatus,
} from "../semester-search-params";
import { APP } from "@/lib/data/utils";
import { SemesterActions } from "./semester-actions";
import Link from "next/link";

export function SemestersTable({
  semesters,
  totalCount,
}: {
  semesters: AdminSemester[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  const [queryState, setQueryState] = useQueryStates(
    semesterSearchParamsParsers,
    {
      history: "replace",
      shallow: false, // We want the page to refresh when query params change to show the loading state.
    }
  );

  // Local state for input to avoid cursor jumping
  const [localQuery, setLocalQuery] = useState(queryState.query || "");

  // Sync local query with URL params when they change externally
  useEffect(() => {
    setLocalQuery(queryState.query || "");
  }, [queryState.query]);

  // Debounced effect to update URL params
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        void setQueryState({
          query: localQuery.trim().length > 0 ? localQuery : null,
          page: 1,
        });
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localQuery, setQueryState]);

  const sorting: SortingState = queryState.sortBy
    ? [{ id: queryState.sortBy, desc: queryState.sortDir === "desc" }]
    : [];

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "year" ||
    queryState.sortDir !== "desc" ||
    queryState.query.length > 0 ||
    queryState.department !== null ||
    queryState.batch !== null ||
    queryState.status !== "all" ||
    queryState.year !== null ||
    queryState.semester !== null;

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const columns: ColumnDef<AdminSemester>[] = [
    {
      id: "srNo",
      header: "Sr No.",
      enableSorting: false,
      cell: ({ row }) => {
        return <div>{row.index + 1}</div>;
      },
    },

    {
      id: "sessionCode",
      header: "Session",
      enableSorting: false,
      accessorFn: (row) => {
        const yearSuffix = row.year.toString().slice(-2);

        return `${row.batch}${yearSuffix}-${row.program}${row.department}`;
      },
      cell: ({ row }) => {
        const yearSuffix = row.original.year.toString().slice(-2);

        return (
          <div className="px-6">
            <Link
              href={`/admin/semester/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {`Sem: ${row.original.semester}-${row.original.batch}${yearSuffix}-${row.original.program}${row.original.department}`}
            </Link>
          </div>
        );
      },
    },
    {
      id: "isActive",
      header: "Status",
      accessorFn: (row) => row.isActive,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "primary" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "startDate",
      header: "Term Dates",
      accessorFn: (row) => row.startDate,
      cell: ({ row }) => (
        <div className="min-w-55">
          {formatDate(row.original.startDate)} -{" "}
          {formatDate(row.original.endDate)}
        </div>
      ),
    },
    {
      id: "registrationStart",
      header: "Registration",
      accessorFn: (row) => row.registrationStart,
      cell: ({ row }) => (
        <div className="min-w-55">
          {formatDate(row.original.registrationStart)} -{" "}
          {formatDate(row.original.registrationEnd)}
        </div>
      ),
    },
    {
      id: "enrollmentStart",
      header: "Enrollment",
      accessorFn: (row) => row.enrollmentStart,
      cell: ({ row }) => (
        <div className="min-w-55">
          {formatDate(row.original.enrollmentStart)} -{" "}
          {formatDate(row.original.enrollmentEnd)}
        </div>
      ),
    },
    {
      id: "offerings",
      header: "Offerings",
      accessorFn: (row) => row._count.subjectOfferings,
      cell: ({ row }) => <span>{row.original._count.subjectOfferings}</span>,
    },
    {
      id: "registrations",
      header: "Registrations",
      accessorFn: (row) => row._count.registrations,
      cell: ({ row }) => <span>{row.original._count.registrations}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <SemesterActions semesterId={row.original.id} />
        </div>
      ),
    },
  ];

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data: semesters,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "year") as typeof queryState.sortBy,
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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 8 },
    (_, index) => currentYear - 3 + index
  );
  const availableSemesters = Array.from(
    new Set(semesters.map((semesterItem) => semesterItem.semester))
  ).toSorted((a, b) => a - b);

  return (
    <div className="max-w-full space-y-4" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <Label htmlFor="semester-search" className="sr-only">
            Search semesters
          </Label>
          <Input
            id="semester-search"
            className="w-70"
            placeholder="Search by session (FA22-BSE), year"
            value={localQuery}
            onChange={(event) => {
              setLocalQuery(event.target.value);
            }}
          />
        </div>

        <Select
          value={queryState.department ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                department:
                  value === "all" ? null : (value as SemesterDepartment),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {semesterDepartmentValues.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={queryState.batch ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                batch: value === "all" ? null : (value as SemesterBatch),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {semesterBatchValues.map((batch) => (
              <SelectItem key={batch} value={batch}>
                {batch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={queryState.status}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                status: value as SemesterStatus,
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {semesterStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all"
                  ? "All Statuses"
                  : status === "active"
                    ? "Active"
                    : "Inactive"}
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
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearOptions
              .toSorted((a, b) => b - a)
              .map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
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
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {availableSemesters.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveParams ? (
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
          <X className="size-4" />
          Clear Filters
        </Button>
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
                      <DraggableTableHeader<AdminSemester>
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
                        <DragAlongCell<AdminSemester> cell={cell} />
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
                    No semesters found.
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
  );
}
