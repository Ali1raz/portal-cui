"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/utils";
import { tryCatch } from "@/hooks/tryCatch";
import { markAttendance } from "../actions";
import { AttendanceTable } from "./attendence-table";
import type { ProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import {
  attendanceFormSchema,
  type AttendanceFormSchemaType,
} from "../zod-schema";
import { ChevronDownIcon } from "lucide-react";

/// Props for the professor attendance form.
type AttendanceFormProps = {
  offeringId: string;
  students: ProfessorSectionStudents[];
};

export function AttendanceForm({ offeringId, students }: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const form = useForm<AttendanceFormSchemaType>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      topic: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
    },
    mode: "onChange",
  });

  const [attendanceMap, setAttendanceMap] = React.useState<
    Record<string, AttendanceStatus>
  >(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      initialMap[student.id] = AttendanceStatus.ABSENT;
    });
    return initialMap;
  });

  const handleStatusChange = React.useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setAttendanceMap((prev) => ({
        ...prev,
        [studentId]: status,
      }));
    },
    []
  );

  function onSubmit(values: AttendanceFormSchemaType) {
    startTransition(async () => {
      const attendances = students.map((student) => ({
        registrationNo: student.registrationNo,
        status: attendanceMap[student.id] ?? AttendanceStatus.ABSENT,
      }));

      const { data: result, error } = await tryCatch(
        markAttendance({
          offeringId,
          topic: values.topic,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          attendances,
        })
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setAttendanceMap((prev) => {
        const next: Record<string, AttendanceStatus> = { ...prev };
        students.forEach((student) => {
          next[student.id] = AttendanceStatus.ABSENT;
        });
        return next;
      });
      form.reset({
        ...values,
        topic: "",
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="p-4 space-y-4 mb-8">
          <h2 className="text-lg font-semibold">Lecture Details</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter lecture topic"
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover
                        open={datePickerOpen}
                        onOpenChange={setDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className="justify-between"
                            >
                              {field.value
                                ? formatDate(field.value)
                                : "Select date"}
                              <ChevronDownIcon className="size-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            captionLayout="label"
                            onSelect={(date) => {
                              field.onChange(date);
                              setDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <AttendanceTable
                students={students}
                attendanceMap={attendanceMap}
                onStatusChange={handleStatusChange}
              />

              <Button type="submit" disabled={isPending} size="lg">
                {isPending ? "Submitting..." : "Mark Attendance"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
