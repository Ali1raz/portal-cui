/* eslint-disable react-hooks/incompatible-library */
"use client";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentGetAttendencesType } from "@/app/data/student/get-student-attendances";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface iAppProps {
  rows: StudentGetAttendencesType[];
  total: number;
  offeringId: string;
}

export default function AttendanceTable({ rows, total }: iAppProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<StudentGetAttendencesType>[]>(
    () => [
      {
        id: "srNo",
        header: "Sr No.",
        enableSorting: false,
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          return <span>{formatDate(row.original.record.date)}</span>;
        },
      },
      {
        id: "time",
        header: "Time",
        cell: ({ row }) => (
          <span>
            {row.original.record.startTime} - {row.original.record.endTime}
          </span>
        ),
      },
      {
        accessorKey: "topic",
        header: "Topic",
        cell: ({ row }) => <p>{row.original.record.topic}</p>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span>{row.original.status}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <h1 className="font-semibold text-lg my-3">Attendance Details</h1>
      <div className="flex items-baseline gap-5 flex-wrap">
        <div className="*:first:text-sm *:first:text-muted-foreground *:not-first:text-lg">
          <h1>Total records</h1>
          <p>{total}</p>
        </div>
        <div className="*:first:text-sm *:first:text-muted-foreground *:not-first:text-lg">
          <h1>Absentees</h1>
          <p>
            {rows.reduce<number>(
              (total, row) => total + (row.status === "ABSENT" ? 1 : 0),
              0
            )}
          </p>
        </div>
        <div className="*:first:text-sm *:first:text-muted-foreground *:not-first:text-lg">
          <h1>Present</h1>
          <p>
            {rows.reduce<number>(
              (total, row) => total + (row.status === "PRESENT" ? 1 : 0),
              0
            )}
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No attendance records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
