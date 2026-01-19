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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { markAttendance } from "../actions";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/tryCatch";

type AttendanceTableData = ProfessorSectionStudents & {
  attendancePercentage: number;
  currentStatus?: AttendanceStatus;
};

export function AttendanceTable({
  students,
}: {
  students: ProfessorSectionStudents[];
}) {
  "use no memo"; // ← Add this directive
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [topic, setTopic] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const [attendanceMap, setAttendanceMap] = React.useState<
    Record<string, AttendanceStatus>
  >(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      initialMap[student.id] = AttendanceStatus.ABSENT;
    });
    return initialMap;
  });

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
          return (
            <div className="font-medium flex flex-col gap-2">
              <span>{row.original.user.name}</span>
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
              value={attendanceMap[studentId]}
              onValueChange={(value) => {
                setAttendanceMap((prev) => ({
                  ...prev,
                  [studentId]: value as AttendanceStatus,
                }));
              }}
              className="flex gap-4"
            >
              {Object.values(AttendanceStatus).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={status}
                    id={`${status.toLowerCase()}-${studentId}`}
                  />
                  <Label
                    htmlFor={`${status.toLowerCase()}-${studentId}`}
                    className="cursor-pointer font-normal"
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
    [attendanceMap]
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

  const handleSubmit = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for this lecture");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);

    const attendances = students.map((student) => ({
      registrationNo: student.registrationNo,
      status: attendanceMap[student.id],
    }));

    const { data: result, error } = await tryCatch(
      markAttendance({
        topic,
        date,
        startTime,
        endTime,
        attendances,
      })
    );

    if (error) {
      toast.error("Something bad happened");
      return;
    }

    if (result.status === "error") {
      toast.error(result.message);
      setIsSubmitting(false);
    } else if (result.status === "success") {
      toast.success(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="p-4 space-y-4 mb-8">
          <h2 className="text-lg font-semibold">Lecture Details</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="topic" className="px-1">
                Topic
              </Label>
              <Input
                id="topic"
                placeholder="Enter lecture topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="date-picker" className="px-1">
                Date
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="justify-between font-normal bg-transparent"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date);
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="start-time" className="px-1">
                Start Time
              </Label>
              <Input
                type="time"
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="end-time" className="px-1">
                End Time
              </Label>
              <Input
                type="time"
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
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

      <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
        {isSubmitting ? "Submitting..." : "Mark Attendance"}
      </Button>

      <div className="text-muted-foreground text-sm">
        Total Students: {students.length}
      </div>
    </div>
  );
}
