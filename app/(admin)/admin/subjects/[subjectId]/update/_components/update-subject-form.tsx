"use client";

import { AdminSubjectForEdit } from "@/app/data/admin/get-subject-for-edit";
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
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { subjectSchema, SubjectSchemaType } from "../../../../schema";
import { updateSubject } from "../actions";

/// Form for updating a subject.
export function UpdateSubjectForm({
  subject,
}: {
  subject: AdminSubjectForEdit;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<SubjectSchemaType>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject.name,
      code: subject.code,
      creditHours: subject.creditHours,
    },
  });

  function onSubmit(values: SubjectSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateSubject(subject.id, values)
      );

      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(`/admin/subjects/${subject.id}`);
      router.refresh();
    });
  }

  return (
    <div>
      <form id="subject-update-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="subject-update-name">
                  Subject Name
                </FieldLabel>
                <Input
                  {...field}
                  id="subject-update-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Update subject name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="subject-update-code">
                  Subject Code
                </FieldLabel>
                <Input
                  {...field}
                  id="subject-update-code"
                  aria-invalid={fieldState.invalid}
                  placeholder="Update subject code"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="creditHours"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="subject-update-creditHours">
                  Credit Hours
                </FieldLabel>
                <Input
                  {...field}
                  id="subject-update-creditHours"
                  aria-invalid={fieldState.invalid}
                  type="number"
                  min={1}
                  step={1}
                  max={4}
                  placeholder="Update credit hours"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
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
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            form.reset({
              name: subject.name,
              code: subject.code,
              creditHours: subject.creditHours,
            })
          }
        >
          Reset
        </Button>
        <Button type="submit" form="subject-update-form" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </Field>
    </div>
  );
}
