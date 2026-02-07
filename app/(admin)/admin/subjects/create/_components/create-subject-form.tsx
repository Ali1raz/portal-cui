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
import { startTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { subjectSchema, SubjectSchemaType } from "../../../schema";
import { createSubject } from "../actions";

export function CreateSubjectForm() {
  const form = useForm<SubjectSchemaType>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      creditHours: 1,
    },
  });

  function onSubmit(values: SubjectSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createSubject(values));
      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        form.reset();
      }
    });
  }

  return (
    <div>
      <form id="subject-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="subject-form-name">
                  Subject Name
                </FieldLabel>
                <Input
                  {...field}
                  id="subject-form-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Add subject name"
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
                <FieldLabel htmlFor="subject-form-code">
                  Subject Code
                </FieldLabel>
                <Input
                  {...field}
                  id="subject-form-code"
                  aria-invalid={fieldState.invalid}
                  placeholder="Add subject code"
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
                <FieldLabel htmlFor="subject-form-creditHours">
                  Credit Hours
                </FieldLabel>
                <Input
                  {...field}
                  id="subject-form-creditHours"
                  aria-invalid={fieldState.invalid}
                  type="number"
                  min={1}
                  step={1}
                  max={4}
                  placeholder="Add credit hours"
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
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="subject-form">
          Submit
        </Button>
      </Field>
    </div>
  );
}
