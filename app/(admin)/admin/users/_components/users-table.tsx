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
} from "lucide-react";
import { format } from "date-fns";
import type { AdminGetUsersType } from "@/app/data/admin/get-admin-users";
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
import Link from "next/link";
import {
  DragAlongCell,
  DraggableTableHeader,
} from "@/components/general/tanstack-table";
import { useQueryStates } from "nuqs";
import { UserActions } from "./user-actions";
import {
  usersDepartmentValues,
  type UsersDepartment,
  usersSearchParamsParsers,
  type UsersRole,
  usersJoinedAtValues,
  type UsersJoinedAt,
} from "../users-search-params";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP } from "@/lib/data/utils";
import { ASSIGNABLE_ROLES } from "@/lib/utils";
import { getJoinedAtLabel } from "@/lib/utils";

export function UsersTable({
  users,
  totalCount,
}: {
  users: AdminGetUsersType[];
  totalCount: number;
}) {
  "use no memo";
  const tableId = useId();
  const [isPending, startTransition] = useTransition();
  /// URL-synced sorting and pagination using nuqs.
  const [queryState, setQueryState] = useQueryStates(usersSearchParamsParsers, {
    history: "replace",
    shallow: false,
  });

  const sorting: SortingState = queryState.sortBy
    ? [{ id: queryState.sortBy, desc: queryState.sortDir === "desc" }]
    : [];

  const hasActiveParams =
    queryState.page !== 1 ||
    queryState.pageSize !== APP.default_page_size ||
    queryState.sortBy !== "name" ||
    queryState.sortDir !== "asc" ||
    queryState.query.length > 0 ||
    queryState.role !== null ||
    queryState.department !== null ||
    queryState.joinedAt !== null;

  const shouldShowDepartmentFilter =
    queryState.role === "PROFESSOR" ||
    queryState.role === "HOD" ||
    queryState.role === "STUDENT" ||
    queryState.role === null;

  const pagination: PaginationState = {
    pageIndex: Math.max(queryState.page - 1, 0),
    pageSize: queryState.pageSize,
  };

  const columns: ColumnDef<AdminGetUsersType>[] = [
    {
      id: "srNo",
      header: "Sr No.",
      enableSorting: false,
      cell: ({ row }) => (
        <div>{pagination.pageIndex * pagination.pageSize + row.index + 1}</div>
      ),
    },
    {
      id: "id",
      header: "Id",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger>
            <div className="font-medium max-w-[20ch] text-ellipsis overflow-hidden">
              {row.original.id}
            </div>
          </TooltipTrigger>
          <TooltipContent align="center" side="right">
            <div>{row.original.id}</div>
          </TooltipContent>
        </Tooltip>
      ),
      enableSorting: false,
    },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <Link
          href={`/admin/users/${row.original.id}`}
          className="hover:text-primary hover:underline hover:underline-offset-4 group-hover:text-primary"
        >
          {row.original.name}
        </Link>
      ),
      sortUndefined: "last",
      sortDescFirst: false,
    },
    {
      id: "email",
      header: "Email",
      accessorFn: (row) => row.email,
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger>
            <div className="font-medium max-w-[20ch] text-ellipsis overflow-hidden">
              {row.original.email}
            </div>
          </TooltipTrigger>
          <TooltipContent align="center" side="right">
            <div>{row.original.email}</div>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      id: "createdAt",
      header: "Joined At",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger>
            <div className="text-sm text-muted-foreground">
              {format(new Date(row.original.createdAt), "dd MMM yyyy, hh:mm a")}
            </div>
          </TooltipTrigger>
          <TooltipContent align="center" side="right">
            <div>
              {format(
                new Date(row.original.createdAt),
                "dd MMM yyyy, hh:mm:ss a"
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      ),
      sortUndefined: "last",
      sortDescFirst: true,
    },
    {
      id: "role",
      header: "Role",
      accessorFn: (row) => row.role,
      cell: ({ row }) => (
        <div className="text-center flex flex-col gap-1">
          <span>{row.original.role}</span>
          <span className="text-xs text-primary/80">
            {row.original.professor?.batchAdvisor && "Batch Advisor"}
          </span>
        </div>
      ),
    },
    {
      id: "department",
      header: "Department",
      enableSorting: false,
      accessorFn: (row) =>
        row.professor?.department ?? row.hod?.department ?? "-",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.professor?.department ??
            row.original.hod?.department ??
            row.original.student?.department ??
            "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <UserActions
            userId={row.original.id}
            hasDepartment={
              row.original.role === "PROFESSOR" &&
              !!row.original.professor?.department
            }
            name={row.original.name}
            userRole={row.original.role}
          />
        </div>
      ),
    },
  ];

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data: users,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      const next = nextSorting[0];

      startTransition(() => {
        void setQueryState({
          sortBy: (next?.id ?? "name") as typeof queryState.sortBy,
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

  /// URL-synced users search filter.
  return (
    <div className="w-full" aria-busy={isPending}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="max-sm:w-full">
          <Label htmlFor="users-search" className="sr-only">
            Search users
          </Label>
          <Input
            id="users-search"
            placeholder="Search by name or email"
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
          value={queryState.role ?? "all"}
          onValueChange={(value) => {
            const nextRole = value === "all" ? null : (value as UsersRole);
            const keepDepartment =
              nextRole === "PROFESSOR" ||
              nextRole === "HOD" ||
              nextRole === "STUDENT" ||
              value === "all";

            startTransition(() => {
              void setQueryState({
                role: nextRole,
                department: keepDepartment ? queryState.department : null,
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ASSIGNABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {shouldShowDepartmentFilter ? (
          <Select
            value={queryState.department ?? "all"}
            onValueChange={(value) => {
              startTransition(() => {
                void setQueryState({
                  department:
                    value === "all" ? null : (value as UsersDepartment),
                  page: 1,
                });
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {usersDepartmentValues.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Select
          value={queryState.joinedAt?.toString() ?? "all"}
          onValueChange={(value) => {
            startTransition(() => {
              void setQueryState({
                joinedAt:
                  value === "all" ? null : (Number(value) as UsersJoinedAt),
                page: 1,
              });
            });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Joined At" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            {usersJoinedAtValues.map((days) => (
              <SelectItem key={days} value={days.toString()}>
                {getJoinedAtLabel(days)}
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
          Clear
        </Button>
      ) : null}
      <div className="rounded-md border mt-4">
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
                      <DraggableTableHeader<AdminGetUsersType>
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
                        <DragAlongCell<AdminGetUsersType> cell={cell} />
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
                    No users found.
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
