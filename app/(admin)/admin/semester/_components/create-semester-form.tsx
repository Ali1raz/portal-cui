"use client";

import { createSemester } from "@/app/(admin)/admin/semester/actions";
import {
  createSemesterSchema,
  CreateSemesterSchemaInputType,
} from "@/app/(admin)/admin/semester/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Batch, Department } from "@/lib/generated/prisma/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { FormDateField } from "@/components/general/form-calendar";

export function CreateSemesterForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const currentMonthNumber = new Date().getMonth() + 1; // getMonth is zero-based

  const form = useForm<CreateSemesterSchemaInputType>({
    resolver: zodResolver(createSemesterSchema),
    defaultValues: {
      semester: 1,
      year: currentYear,
      department: Department.CS,
      batch: currentMonthNumber >= 6 ? "FA" : "SP",
      startDate: undefined,
      endDate: undefined,
      registrationStart: undefined,
      registrationEnd: undefined,
      enrollmentStart: undefined,
      enrollmentEnd: undefined,
      addDeadline: undefined,
      dropDeadline: undefined,
      lateDropDeadline: undefined,
      isActive: true,
    },
    mode: "onChange",
  });

  function onSubmit(values: CreateSemesterSchemaInputType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createSemester(values));

      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset();
      router.refresh();
    });
  }

  return (
    <form id="semester-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="semester"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="semester-form-semester">
                  Semester Number
                </FieldLabel>
                <Input
                  id="semester-form-semester"
                  type="number"
                  min={1}
                  max={10}
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
            name="year"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="semester-form-year">Year</FieldLabel>
                <Input
                  id="semester-form-year"
                  type="number"
                  min={2000}
                  max={2100}
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
            name="department"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="semester-form-department">
                  Department
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="semester-form-department"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Department).map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="batch"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="semester-form-batch">Batch</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="semester-form-batch" className="w-full">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Batch).map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <FormDateField
            control={form.control}
            name="startDate"
            label="Semester Start Date"
            hint="term begins"
          />
          <FormDateField
            control={form.control}
            name="endDate"
            label="Semester End Date"
            hint="term ends"
          />
          <FormDateField
            control={form.control}
            name="registrationStart"
            label="Registration Start"
            hint="students can apply"
          />
          <FormDateField
            control={form.control}
            name="registrationEnd"
            label="Registration End"
            hint="application semester closes"
          />
          <FormDateField
            control={form.control}
            name="enrollmentStart"
            label="Enrollment Start"
            hint="subject selection opens"
          />
          <FormDateField
            control={form.control}
            name="enrollmentEnd"
            label="Enrollment End"
            hint="subject selection deadline"
          />
          <FormDateField
            control={form.control}
            name="addDeadline"
            label="Add Deadline"
            hint="last day to add subject"
          />
          <FormDateField
            control={form.control}
            name="dropDeadline"
            label="Drop Deadline"
            hint="drop without transcript record"
          />
          <FormDateField
            control={form.control}
            name="lateDropDeadline"
            label="Late Drop Deadline"
            hint="withdrawal (W) cutoff"
          />

          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <Field
                orientation="horizontal"
                className="items-center gap-3 md:col-span-2"
              >
                <Checkbox
                  id="semester-form-isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="semester-form-isActive">
                  Set as active semester
                </FieldLabel>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button disabled={isPending} type="submit" form="semester-form">
          {isPending ? "Creating..." : "Create Semester"}
        </Button>
      </Field>
    </form>
  );
}
