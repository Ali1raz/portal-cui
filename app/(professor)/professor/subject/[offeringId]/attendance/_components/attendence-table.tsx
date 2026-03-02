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
  RowSelectionState,
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type AttendanceTableData = ProfessorSectionStudents & {
  attendancePercentage: number;
  currentStatus?: AttendanceStatus;
};

export function AttendanceTable({
  students,
  attendanceMap,
  onStatusChange,
  offeringId,
}: {
  students: ProfessorSectionStudents[];
  attendanceMap: Record<string, AttendanceStatus>;
  offeringId: string;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
}) {
  "use no memo"; // ← Add this directive
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

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
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center gap-2 me-2">
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
            <span className="text-muted-foreground text-sm">Sr. No</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              size="sm"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
            <span className="text-muted-foreground text-sm">
              {row.index + 1}
            </span>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
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
          const leaveRequest = row.original.pendingLeaveRequest;
          const status = row.original.pendingLeaveRequest?.status;
          return (
            <div className="font-medium flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span>{row.original.user.name}</span>
                {leaveRequest ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      {leaveRequest.status === "PENDING" && (
                        <AlertCircle className="size-4 text-destructive animate-caret-blink duration-75" />
                      )}
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Leave Request</DialogTitle>
                        <DialogDescription>
                          {status} leave request details
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(leaveRequest.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Reason</p>
                          <p className="text-sm text-muted-foreground">
                            {leaveRequest.reasonTitle}
                          </p>
                        </div>
                      </div>
                      <DialogFooter className="sm:justify-start">
                        <Link
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                          href={`/professor/subject/${offeringId}/leave-requests/${row.original.pendingLeaveRequest.id}`}
                        >
                          View Details
                        </Link>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
    [attendanceMap, onStatusChange, offeringId]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const selectedStudentIds = React.useMemo(
    () => Object.keys(rowSelection),
    [rowSelection]
  );

  const handleBulkStatusChange = (status: AttendanceStatus) => {
    selectedStudentIds.forEach((studentId) => {
      onStatusChange(studentId, status);
    });
    setRowSelection({});
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Total Students: {students.length}
            {selectedStudentIds.length > 0 && (
              <span className="ml-2 font-medium text-foreground">
                • {selectedStudentIds.length} selected
              </span>
            )}
          </div>

          {selectedStudentIds.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange(AttendanceStatus.PRESENT)}
              >
                Mark as Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange(AttendanceStatus.ABSENT)}
              >
                Mark as Absent
              </Button>
            </div>
          )}
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
