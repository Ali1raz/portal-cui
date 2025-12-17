"use client";

import { StudentEnrolledSubject } from "@/app/data/student/get-subjects-enrolled";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendLeaveRequest } from "../actions";
import { LeaveRequestFormType, leaveRequestSchema } from "../schema";

export function LeaveRequestForm({
  subjects,
  studentId,
}: {
  subjects: StudentEnrolledSubject["subjects"];
  studentId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<LeaveRequestFormType>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      date: undefined,
      reasonTitle: "",
      reasonDetails: "",
      imageKey: "",
      subjectId: "",
    },
    mode: "onChange",
  });

  // 2. Define a submit handler.
  function onSubmit(values: LeaveRequestFormType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        sendLeaveRequest(values, studentId)
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        form.reset();
        router.refresh();
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
                    <SelectItem key={s.id} value={s.id}>
                      {i + 1}. {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
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
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
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
              <FormLabel>Small Description</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-28"
                  placeholder="Provide a detailed reason for your leave..."
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
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Uploader
                  fileTypeAccepted="image" // doc for future
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? "Submitting..." : "Submit Leave Request"}
        </Button>
      </form>
    </Form>
  );
}
