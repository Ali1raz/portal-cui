"use client";

import { StudentEnrolledSubject } from "@/app/data/student/get-subjects-enrolled";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Uploader from "@/components/uploader";
import { tryCatch } from "@/hooks/tryCatch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateLeaveRequest } from "../actions";
import {
  LeaveRequestFormType,
  leaveRequestSchema,
} from "../../request-leave/schema";

export function UpdateLeaveRequestForm({
  subjects,
  leaveRequestId,
  initialValues,
}: {
  subjects: StudentEnrolledSubject["subjects"];
  leaveRequestId: string;
  initialValues: {
    subjectId: string;
    date: Date;
    reasonTitle: string;
    reasonDetails: string;
    imageKey: string;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<LeaveRequestFormType>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      date: initialValues.date,
      reasonTitle: initialValues.reasonTitle,
      reasonDetails: initialValues.reasonDetails,
      imageKey: initialValues.imageKey,
      subjectId: initialValues.subjectId,
    },
    mode: "onChange",
  });

  // 2. Define a submit handler.
  function onSubmit(values: LeaveRequestFormType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateLeaveRequest(leaveRequestId, values)
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.push(`/student/past-leave-requests/${leaveRequestId}`);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((s, i) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <span>
                        {i + 1}. {s.name} - {s.code}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormDateField
          control={form.control}
          name="date"
          label="Date"
          hint="leave date"
          calendarProps={{
            disabled: (date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 4);
              maxDate.setHours(23, 59, 59, 999);

              const isPast = date < today;
              const isTooFar = date > maxDate;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return isPast || isTooFar || isWeekend;
            },
          }}
        />

        <FormField
          control={form.control}
          name="reasonTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Short title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reasonDetails"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Description (keep it concise)</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-28"
                  placeholder="Provide a reason for your leave..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageKey"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Image (Optional)</FormLabel>
              <FormControl>
                <Uploader
                  fileTypeAccepted="image"
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Leave Request"}
        </Button>
      </form>
    </Form>
  );
}
