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
import {
  attendanceFormSchema,
  type AttendanceFormSchemaType,
} from "../zod-schema";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { demoDateTimePickerData } from "@/lib/data/attendence-form";

/// Props for the professor attendance form.
type AttendanceFormProps = {
  offeringId: string;
  students: ProfessorSectionStudents[];
};

export function AttendanceForm({ offeringId, students }: AttendanceFormProps) {
  const [isPending, startTransition] = useTransition();

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

  /// Normalizes time text like "9:00am" to 24-hour "HH:mm" for form submission.
  const to24Hour = React.useCallback((timeText: string) => {
    const match = timeText.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (!match) return timeText;
    const [, rawHour, rawMinute, period] = match;
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    const isPm = period.toLowerCase() === "pm";
    const normalizedHour = (hour % 12) + (isPm ? 12 : 0);
    return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }, []);

  /// Builds readable time ranges like "9:00am - 10:00am" for the picker.
  const timeRanges = React.useMemo(() => {
    const slots = demoDateTimePickerData.availableTimeSlots ?? [];
    return slots.map((slot) => {
      const [rawHour, rawMinutePeriod] = slot.split(":");
      const minute = rawMinutePeriod?.slice(0, 2) ?? "00";
      const period = rawMinutePeriod?.slice(2).toLowerCase() ?? "am";
      const hourNumber = Number(rawHour);
      const baseHour = (hourNumber % 12) + (period === "pm" ? 12 : 0);
      const end = new Date();
      end.setHours(baseHour + 1, Number(minute), 0, 0);
      const endHour = end.getHours() % 12 || 12;
      const endPeriod = end.getHours() >= 12 ? "pm" : "am";
      const endText = `${endHour}:${String(end.getMinutes()).padStart(2, "0")}${endPeriod}`;
      return `${slot} - ${endText}`;
    });
  }, []);

  /// Extracts start/end times from a time range string.
  const parseTimeRange = React.useCallback(
    (timeRange: string) => {
      const [start, end] = timeRange.split("-").map((value) => value.trim());
      return {
        startTime: to24Hour(start),
        endTime: to24Hour(end ?? start),
      };
    },
    [to24Hour]
  );

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

          <DateTimePicker
            data={{
              ...demoDateTimePickerData,
              availableTimeSlots: timeRanges,
              // timezone: "Karachi, Islamabad",
            }}
            appearance={{
              showTitle: true,
              // showTimezone: true,
              // weekStartsOn: "sunday", // "sunday" | "monday" | "saturday"
            }}
            actions={{
              onNext: (date, time) => {
                const { startTime, endTime } = parseTimeRange(time);
                form.setValue("date", date, { shouldValidate: true });
                form.setValue("startTime", startTime, {
                  shouldValidate: true,
                });
                form.setValue("endTime", endTime, { shouldValidate: true });
                // console.log("Selected Date:", date);
                // console.log("Start Time:", startTime);
                // console.log("End Time:", endTime);
              },
            }}
          />

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
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={() => (
                    <FormItem>
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
