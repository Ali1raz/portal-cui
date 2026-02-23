"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
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
import { AttendanceStatus } from "@/lib/generated/prisma/enums";
import { tryCatch } from "@/hooks/tryCatch";
import { markAttendance } from "../actions";
import { AttendanceTable } from "./attendence-table";
import type { ProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import { attendanceFormSchema, AttendanceFormSchemaType } from "../zod-schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { availableTimesForAttendance } from "@/lib/data/attendence-form";

/// Props for the professor attendance form.
type AttendanceFormProps = {
  offeringId: string;
  students: ProfessorSectionStudents[];
};

export function AttendanceForm({ offeringId, students }: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = React.useState<Date | undefined>();

  const form = useForm<AttendanceFormSchemaType>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      topic: "",
      date: new Date(),
      startTime: availableTimesForAttendance[0],
      endTime: availableTimesForAttendance[1],
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

  const today = React.useMemo(() => {
    const next = new Date();
    next.setHours(0, 0, 0, 0); // idk why this
    // is needed but without this the calendar allows selecting the current date even if it's past midnight

    return next;
  }, []);

  const setDateValue = (date: Date | undefined) => {
    if (!date) {
      form.setValue("date", new Date(), { shouldValidate: true });
      return;
    }
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    if (next > today) {
      form.setError("date", {
        message: "date should be in the past.",
      });
      return;
    }

    form.setValue("date", next, { shouldValidate: true });
  };

  function onSubmit(values: AttendanceFormSchemaType) {
    startTransition(async () => {
      const attendances = students.map((student) => ({
        registrationNo: student.registrationNo,
        status: attendanceMap[student.id] ?? AttendanceStatus.ABSENT,
      }));

      const { data: result, error } = await tryCatch(
        markAttendance({
          offeringId,
          attendances,
          values: {
            topic: values.topic,
            date: values.date,
            startTime: values.startTime,
            endTime: values.endTime,
          },
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
              <div className="grid gap-4 lg:grid-cols-2">
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

                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span className="text-muted-foreground">
                                  Pick a date
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                              setDate(date);
                              setDateValue(date);
                            }}
                            disabled={(date) => date > today}
                          />
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2 grid-cols-1">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>

                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                {field.value}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="w-[180px]">
                              <div className="flex gap-4 flex-col">
                                <div className="space-y-2 px-4 pt-4">
                                  <p className="text-center text-sm font-medium">
                                    Available Times
                                  </p>
                                </div>
                                <ScrollArea className="h-full overflow-y-auto">
                                  <div className="grid grid-cols-1 gap-2 px-4 pb-4">
                                    {availableTimesForAttendance.map(
                                      (time, i) => (
                                        <Button
                                          key={time}
                                          size="sm"
                                          onClick={() => {
                                            form.setValue("startTime", time);
                                            form.setValue(
                                              "endTime",
                                              availableTimesForAttendance[i + 1]
                                            );
                                          }}
                                          variant={
                                            time === field.value
                                              ? "default"
                                              : "outline"
                                          }
                                        >
                                          {time}
                                        </Button>
                                      )
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                {field.value}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="w-[180px]">
                              <div className="flex gap-4 flex-col">
                                <div className="space-y-2 px-4 pt-4">
                                  <p className="text-center text-sm font-medium">
                                    Available Times
                                  </p>
                                </div>
                                <ScrollArea className="h-full overflow-y-auto">
                                  <div className="grid grid-cols-1 gap-2 px-4 pb-4">
                                    {availableTimesForAttendance.map((time) => (
                                      <Button
                                        key={time}
                                        size="sm"
                                        onClick={() => {
                                          form.setValue("endTime", time);
                                        }}
                                        disabled={
                                          form.getValues("startTime") === time
                                        }
                                        variant={
                                          time === field.value
                                            ? "default"
                                            : "outline"
                                        }
                                      >
                                        {time}
                                      </Button>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <AttendanceTable
                offeringId={offeringId}
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
