"use client";

import { AdminOfferingFormSubject } from "@/app/data/admin/get-offering-form-data";
import { AdminOfferingFormSemester } from "@/app/data/admin/get-offering-form-data";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tryCatch } from "@/hooks/tryCatch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOffering } from "../actions";
import {
  createOfferingSchema,
  CreateOfferingSchemaInputType,
} from "../../schema";

/// Props for the admin create offering form.
type AdminCreateOfferingFormProps = {
  subjects: AdminOfferingFormSubject[];
  semesters: AdminOfferingFormSemester[];
};

export function AdminCreateOfferingForm({
  subjects,
  semesters,
}: AdminCreateOfferingFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasEligibleSemesters = semesters.length > 0;

  const form = useForm<CreateOfferingSchemaInputType>({
    resolver: zodResolver(createOfferingSchema),
    defaultValues: {
      subjectId: "",
      semesterId: "",
      totalLectures: 30,
    },
    mode: "onChange",
  });

  function onSubmit(values: CreateOfferingSchemaInputType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createOffering(values));

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      if (!result.offeringId) {
        toast.error("Offering created, but redirect failed.");
        return;
      }

      toast.success(result.message);
      router.push(`/admin/offering/${result.offeringId}`);
    });
  }

  return (
    <form id="offering-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="subjectId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="offering-form-subject">Subject</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="offering-form-subject" className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="totalLectures"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="offering-form-totalLectures">
                  Total Lectures
                </FieldLabel>
                <Input
                  id="offering-form-totalLectures"
                  type="number"
                  min={1}
                  step={1}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="semesterId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="offering-form-semester">
                  Semester
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="offering-form-semester" className="w-full">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {`Sem ${semester.semester} - ${semester.batch}-${semester.year} (${semester?.program ?? "B"}${semester.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        {!hasEligibleSemesters ? (
          <p className="text-sm text-muted-foreground">
            No active semesters are currently available for offering creation.
          </p>
        ) : null}
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button
          disabled={isPending || !hasEligibleSemesters}
          type="submit"
          form="offering-form"
        >
          {isPending ? "Creating..." : "Create offering"}
        </Button>
      </Field>
    </form>
  );
}
