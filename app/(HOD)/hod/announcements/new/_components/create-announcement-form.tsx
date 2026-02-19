"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AnnouncementType } from "@/lib/generated/prisma/enums";
import { tryCatch } from "@/hooks/tryCatch";
import Uploader from "@/components/uploader";
import { announcementSchema, AnnouncementSchemaType } from "../../schema";
import { createAnnouncement } from "../actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

/// Form for HODs to create draft announcements.
export function CreateAnnouncementForm() {
  const [isPending, startTransition] = useTransition();
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const form = useForm<AnnouncementSchemaType>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      type: AnnouncementType.ACADEMIC,
      scheduledFor: null,
      isPinned: false,
      imageKey: "",
    },
    mode: "onChange",
  });

  const scheduledFor = useWatch({
    control: form.control,
    name: "scheduledFor",
  });

  const today = useMemo(() => {
    const next = new Date();
    next.setHours(0, 0, 0, 0); // idk why this
    // is needed but without this the calendar allows selecting the current date even if it's past midnight

    return next;
  }, []);

  const maxScheduleDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 2);
    max.setHours(0, 0, 0, 0);
    return max;
  }, []);

  const setScheduleValue = (date: Date | undefined) => {
    if (!date) {
      form.setValue("scheduledFor", null, { shouldValidate: true });
      return;
    }
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    if (next < today) {
      form.setError("scheduledFor", {
        message: "Scheduled date must be in the future.",
      });
      return;
    }
    if (next > maxScheduleDate) {
      form.setError("scheduledFor", {
        message: "Announcements can only be scheduled up to 2 days from now.",
      });
      return;
    }
    form.setValue("scheduledFor", next, { shouldValidate: true });
  };

  function onSubmit(values: AnnouncementSchemaType) {
    if (scheduleEnabled && !values.scheduledFor) {
      form.setError("scheduledFor", {
        message: "Pick a publish date.",
      });
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        createAnnouncement(values)
      );
      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        form.reset();
        setScheduleEnabled(false);
        form.setValue("imageKey", "");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="announcement-title">Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="announcement-title"
                  placeholder="Announcement title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="announcement-content">Details</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  id="announcement-content"
                  placeholder="Share the announcement details"
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="announcement-type">
                Announcement Type
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger id="announcement-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(AnnouncementType).map((type) => (
                    <SelectItem key={type} value={type}>
                      <span>{type}</span>
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
          name="imageKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="announcement-image">
                Add Image (optional)
              </FormLabel>
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
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="isPinned"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="announcement-pin"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel htmlFor="announcement-pin">
                    Pin announcement
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <div className="flex items-center gap-2">
              <Checkbox
                id="announcement-schedule"
                checked={scheduleEnabled}
                onCheckedChange={(checked) => {
                  const enabled = checked === true;
                  setScheduleEnabled(enabled);
                  if (!enabled) {
                    form.setValue("scheduledFor", null, {
                      shouldValidate: true,
                    });
                    setScheduledDate(undefined);
                  }
                }}
              />
              <FormLabel htmlFor="announcement-schedule">
                Schedule publish date (max 2 days)
              </FormLabel>
            </div>
          </FormItem>
        </div>

        {scheduleEnabled ? (
          <FormField
            control={form.control}
            name="scheduledFor"
            render={({ field }) => (
              <FormItem>
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
                      selected={scheduledDate}
                      onSelect={(date) => {
                        setScheduledDate(date);
                        setScheduleValue(date);
                      }}
                      disabled={(date) =>
                        date < today || date > maxScheduleDate
                      }
                    />
                  </PopoverContent>
                </Popover>

                {scheduledFor ? (
                  <p className="text-xs text-muted-foreground">
                    Scheduled for {scheduledFor.toLocaleDateString()}
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="flex flex-row gap-2">
          <Button disabled={isPending} type="submit">
            {isPending ? "Submitting..." : "Save Draft"}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
