"use client";

import { updateSemester } from "@/app/(admin)/admin/semester/actions";
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
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { FormDateField } from "@/components/general/form-calendar";
import { useRouter } from "next/navigation";

type EditSemesterFormProps = {
  semesterId: string;
  initialValues: CreateSemesterSchemaInputType;
};

export function EditSemesterForm({
  semesterId,
  initialValues,
}: EditSemesterFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateSemesterSchemaInputType>({
    resolver: zodResolver(createSemesterSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  function onSubmit(values: CreateSemesterSchemaInputType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateSemester(semesterId, values)
      );

      if (error) {
        toast.error("Unable to update semester. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(`/admin/semester/${semesterId}`);
    });
  }

  return (
    <form id="semester-edit-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="semester"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="semester-edit-form-semester">
                  Semester Number
                </FieldLabel>
                <Input
                  id="semester-edit-form-semester"
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
                <FieldLabel htmlFor="semester-edit-form-year">Year</FieldLabel>
                <Input
                  id="semester-edit-form-year"
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
                <FieldLabel htmlFor="semester-edit-form-department">
                  Department
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="semester-edit-form-department"
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
                <FieldLabel htmlFor="semester-edit-form-batch">
                  Batch
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="semester-edit-form-batch"
                    className="w-full"
                  >
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
                  id="semester-edit-form-isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="semester-edit-form-isActive">
                  Set as active semester
                </FieldLabel>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset(initialValues)}
        >
          Reset
        </Button>
        <Button disabled={isPending} type="submit" form="semester-edit-form">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </Field>
    </form>
  );
}
