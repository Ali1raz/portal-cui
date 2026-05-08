"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormDateField } from "@/components/general/form-calendar";
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
import { markAttendance, updateAttendance } from "../actions";
import { AttendanceTable } from "./attendence-table";
import type { ProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import { attendanceFormSchema, AttendanceFormSchemaType } from "../zod-schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { availableTimesForAttendance } from "@/lib/data/attendence-form";

/// Props for the professor attendance form.
type AttendanceFormProps = {
  offeringId: string;
  students: ProfessorSectionStudents[];
  initialData?: {
    recordId: string;
    topic: string;
    date: Date;
    startTime: string;
    endTime: string;
    attendances: Record<string, AttendanceStatus>; // studentId -> status
  };
};

export function AttendanceForm({
  offeringId,
  students,
  initialData,
}: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AttendanceFormSchemaType>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      topic: initialData?.topic ?? "",
      date: initialData?.date ?? new Date(),
      startTime: initialData?.startTime ?? availableTimesForAttendance[0],
      endTime: initialData?.endTime ?? availableTimesForAttendance[1],
    },
    mode: "onChange",
  });

  const [attendanceMap, setAttendanceMap] = React.useState<
    Record<string, AttendanceStatus>
  >(() => {
    if (initialData) return initialData.attendances;
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

  function onSubmit(values: AttendanceFormSchemaType) {
    startTransition(async () => {
      const attendances = students.map((student) => ({
        registrationNo: student.registrationNo,
        status: attendanceMap[student.id] ?? AttendanceStatus.ABSENT,
      }));

      const payload = {
        offeringId,
        attendances,
        values: {
          topic: values.topic,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
        },
      };

      const { data: result, error } = await tryCatch(
        initialData
          ? updateAttendance({ recordId: initialData.recordId, ...payload })
          : markAttendance(payload)
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

      if (!initialData) {
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
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden">
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold">Lecture Details</h2>

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
                <FormDateField
                  control={form.control}
                  name="date"
                  label="Date"
                  hint="lecture date"
                  calendarProps={{
                    disabled: (date) =>
                      date > today ||
                      date.getDay() === 0 ||
                      date.getDay() === 6,
                  }}
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
