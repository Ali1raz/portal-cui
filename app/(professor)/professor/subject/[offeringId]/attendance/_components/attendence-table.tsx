/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";
import { UserImage } from "@/components/user/user-image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type AttendanceTableData = ProfessorSectionStudents & {
  attendancePercentage: number;
  currentStatus?: AttendanceStatus;
};

export function AttendanceTable({
  students,
  attendanceMap,
  onStatusChange,
}: {
  students: ProfessorSectionStudents[];
  attendanceMap: Record<string, AttendanceStatus>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
}) {
  "use no memo"; // ← Add this directive
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableData: AttendanceTableData[] = React.useMemo(
    () =>
      students.map((student) => ({
        ...student,
        attendancePercentage: student.attendancePercentage,
        currentStatus: attendanceMap[student.id],
      })),
    [students, attendanceMap]
  );

  const columns: ColumnDef<AttendanceTableData>[] = React.useMemo(
    () => [
      {
        accessorKey: "user.image",
        header: "",
        cell: ({ row }) => {
          const name = row.original.user.name;
          const image = row.original.user.image;
          return <UserImage image={image} name={name} className="size-10" />;
        },
        enableSorting: false,
      },
      {
        accessorKey: "user.name",
        header: "Name",
        cell: ({ row }) => {
          const percentage = row.original.attendancePercentage;
          const pendingLeaveRequest = row.original.pendingLeaveRequest;
          return (
            <div className="font-medium flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span>{row.original.user.name}</span>
                {pendingLeaveRequest ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="size-4 text-primary/90" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs ">
                      <div className="space-y-1">
                        <p className="font-medium">Pending leave request</p>
                        <p className="text-xs">
                          {formatDate(pendingLeaveRequest.date)}
                        </p>
                        <p className="text-xs">
                          {pendingLeaveRequest.reasonTitle}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              <span className="text-muted-foreground text-sm">
                {percentage.toFixed(1)}% attendance
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "registrationNo",
        header: "Registration Number",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.registrationNo}
          </div>
        ),
      },
      {
        id: "status",
        header: "Mark Attendance",
        cell: ({ row }) => {
          const studentId = row.original.id;
          return (
            <RadioGroup
              value={attendanceMap[studentId] ?? AttendanceStatus.ABSENT}
              onValueChange={(value) => {
                onStatusChange(studentId, value as AttendanceStatus);
              }}
              className="flex gap-4"
            >
              {Object.values(AttendanceStatus).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <RadioGroupItem
                    className="group"
                    value={status}
                    id={`${status}-${studentId}`}
                  />
                  <Label
                    htmlFor={`${status}-${studentId}`}
                    className="cursor-pointer group-hover:text-primary group-hover:underline hover:underline-offset-4"
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        },
      },
    ],
    [attendanceMap, onStatusChange]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="text-muted-foreground text-sm">
          Total Students: {students.length}
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
