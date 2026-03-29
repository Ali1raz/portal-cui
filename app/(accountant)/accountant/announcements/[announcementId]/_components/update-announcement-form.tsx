"use client";

import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  Department,
  Program,
  Batch,
} from "@/lib/generated/prisma/enums";
import { FormDateField } from "@/components/general/form-calendar";
import { tryCatch } from "@/hooks/tryCatch";
import Uploader from "@/components/uploader";
import {
  accountantAnnouncementSchema,
  AccountantAnnouncementSchemaType,
} from "../../schema";
import { Loader2 } from "lucide-react";
import { AccountantGetAnnouncementForUpdateType } from "@/app/data/accountant/get-announcement-for-update";
import { accountantUpdateAnnouncement } from "../../actions";
import { formatEnumLabel } from "@/lib/utils";

/// Form for accountants to update existing fee announcements.
export function UpdateAnnouncementForm({
  announcement,
}: {
  /// Existing announcement data to pre-populate form.
  announcement: AccountantGetAnnouncementForUpdateType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AccountantAnnouncementSchemaType>({
    resolver: zodResolver(accountantAnnouncementSchema),
    defaultValues: {
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      scheduledFor: announcement.scheduledFor,
      isPinned: announcement.isPinned,
      imageKey: announcement.imageKey || "",
      status: announcement.status || "PUBLISHED",
      targetDepartment: announcement.targetDepartment,
      targetProgram: announcement.targetProgram,
      targetBatch: announcement.targetBatch,
      targetYear: announcement.targetYear,
    },
    mode: "onChange",
  });

  const status = useWatch({
    control: form.control,
    name: "status",
  });

  const today = useMemo(() => {
    const next = new Date();
    next.setHours(0, 0, 0, 0);
    return next;
  }, []);

  const maxScheduleDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 2);
    max.setHours(0, 0, 0, 0);
    return max;
  }, []);

  function onSubmit(values: AccountantAnnouncementSchemaType) {
    if (values.status === "SCHEDULED" && !values.scheduledFor) {
      form.setError("scheduledFor", {
        message: "Pick a publish date.",
      });
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        accountantUpdateAnnouncement(announcement.id, values)
      );
      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.push("/accountant/announcements");
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
                      <span>{formatEnumLabel(type)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Target Audience (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Leave all fields empty to broadcast to all students
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              name="targetDepartment"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="target-department">Department</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "all" ? null : value)
                    }
                    value={field.value || "all"}
                  >
                    <FormControl>
                      <SelectTrigger id="target-department" className="w-full">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {Object.values(Department).map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {formatEnumLabel(dept)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="targetProgram"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="target-program">Program</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "all" ? null : value)
                    }
                    value={field.value || "all"}
                  >
                    <FormControl>
                      <SelectTrigger id="target-program" className="w-full">
                        <SelectValue placeholder="All programs" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {Object.values(Program).map((program) => (
                        <SelectItem key={program} value={program}>
                          {formatEnumLabel(program)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="targetBatch"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="target-batch">Batch</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "all" ? null : value)
                    }
                    value={field.value || "all"}
                  >
                    <FormControl>
                      <SelectTrigger id="target-batch" className="w-full">
                        <SelectValue placeholder="All batches" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {Object.values(Batch).map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {formatEnumLabel(batch)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="targetYear"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="target-year">Year</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="target-year"
                      type="number"
                      placeholder="e.g., 2024"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
                      <span>{formatEnumLabel(type)}</span>
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
                Updating...
              </>
            ) : (
              "Update announcement"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
