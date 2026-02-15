"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComplaintCategory } from "@/lib/generated/prisma/enums";
import Uploader from "@/components/uploader";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { tryCatch } from "@/hooks/tryCatch";
import { complaintSchema, ComplaintSchemaType } from "../../../schema";
import { UpdateComplaint } from "../../../actions";

/// Update complaint form for student complaints.
export function UpdateComplaintForm({
  complaintId,
  initialValues,
}: {
  /// Complaint id for update action.
  complaintId: string;
  /// Initial complaint values.
  initialValues: ComplaintSchemaType;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ComplaintSchemaType>({
    resolver: zodResolver(complaintSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  function onSubmit(values: ComplaintSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        UpdateComplaint(complaintId, values)
      );

      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        form.reset();
        router.push(`/student/complaints/${complaintId}`);
      }
    });
  }

  return (
    <div>
      <form id="complaint-update-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="complaint-title">Title</FieldLabel>
                <Input
                  {...field}
                  id="complaint-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter title"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="details"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="details">
                  Add Details (should be concise)
                </FieldLabel>
                <Textarea
                  {...field}
                  id="details"
                  aria-invalid={fieldState.invalid}
                  placeholder="Add details"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="complaint-category">Category</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="complaint-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ComplaintCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        <span>{category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="imageKey"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="image">Add Image (optional)</FieldLabel>
                <Uploader
                  fileTypeAccepted="image"
                  onChange={field.onChange}
                  value={field.value}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <Field orientation="horizontal" className="justify-end space-x-2 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset(initialValues)}
        >
          Reset
        </Button>
        <Button disabled={isPending} type="submit" form="complaint-update-form">
          {isPending ? "Updating..." : "Update"}
        </Button>
      </Field>
    </div>
  );
}
