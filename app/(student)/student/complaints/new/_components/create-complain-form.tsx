"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/tryCatch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTransition } from "react";
import { complaintSchema, ComplaintSchemaType } from "../../schema";
import { CreateComplaint } from "../../actions";
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

export function CreateComplaintForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ComplaintSchemaType>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      category: "ACADEMIC",
      details: "",
      imageKey: "",
      title: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: ComplaintSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(CreateComplaint(values));
      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        form.reset();
        router.push("/student/complaints");
      }
    });
  }
  return (
    <div>
      <form id="complaint-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                <FieldLabel htmlFor="subject-form-creditHours">
                  Credit Hours
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ComplaintCategory).map((catg) => (
                      <SelectItem key={catg} value={catg}>
                        <span>{catg}</span>
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
                  fileTypeAccepted="image" // doc for future
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

      <Field orientation="horizontal" className="justify-end space-x-2 mt-8 ">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button disabled={isPending} type="submit" form="complaint-form">
          {isPending ? "Submiting..." : "Submit"}
        </Button>
      </Field>
    </div>
  );
}
