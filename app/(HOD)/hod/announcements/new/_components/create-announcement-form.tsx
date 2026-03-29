"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  AnnouncementStatus,
  AnnouncementType,
} from "@/lib/generated/prisma/enums";
import { FormDateField } from "@/components/general/form-calendar";
import { tryCatch } from "@/hooks/tryCatch";
import Uploader from "@/components/uploader";
import { announcementSchema, AnnouncementSchemaType } from "../../schema";
import { Loader2 } from "lucide-react";
import { hodCreateAnnouncement } from "../../actions";
import { useRouter } from "next/navigation";

/// Form for HODs to create draft announcements.
export function HodCreateAnnouncementForm() {
  const [isPending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  const form = useForm<AnnouncementSchemaType>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      type: AnnouncementType.ACADEMIC,
      scheduledFor: null,
      isPinned: false,
      imageKey: "",
      status: "DRAFT",
    },
    mode: "onChange",
  });

  const status = useWatch({
    control: form.control,
    name: "status",
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

  function onSubmit(values: AnnouncementSchemaType) {
    if (values.status === "SCHEDULED" && !values.scheduledFor) {
      form.setError("scheduledFor", {
        message: "Pick a publish date.",
      });
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        hodCreateAnnouncement(values)
      );
      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        setResetKey((prev) => prev + 1);
        form.reset();
        router.push("/hod/announcements");
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
                  key={resetKey}
                  fileTypeAccepted="image"
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="announcement-status">Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger id="announcement-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(AnnouncementStatus).map((type) => (
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

        {status === "SCHEDULED" ? (
          <FormDateField
            control={form.control}
            name="scheduledFor"
            label="Schedule Date"
            hint="publish date"
            calendarProps={{
              disabled: (date) => date < today || date > maxScheduleDate,
            }}
          />
        ) : null}

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

        <div className="flex flex-row gap-2">
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Creating...
              </>
            ) : (
              "Create announcement"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset form
          </Button>
        </div>
      </form>
    </Form>
  );
}
