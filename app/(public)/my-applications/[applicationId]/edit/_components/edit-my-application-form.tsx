"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormDateField } from "@/components/general/form-calendar";
import { tryCatch } from "@/hooks/tryCatch";
import { Department, Gender } from "@/lib/generated/prisma/enums";
import type { UserGetApplicationDetailsType } from "@/app/data/user/user-get-application-details";

import { updateMyApplication } from "../actions";
import {
  updateMyApplicationSchema,
  type UpdateMyApplicationInput,
} from "../schemas";

type EditMyApplicationFormProps = {
  application: UserGetApplicationDetailsType;
};

export function EditMyApplicationForm({
  application,
}: EditMyApplicationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateMyApplicationInput>({
    resolver: zodResolver(updateMyApplicationSchema),
    defaultValues: {
      fullName: application.fullName,
      dateOfBirth: application.dateOfBirth,
      gender: application.gender,
      address: application.address,
      city: application.city,
      phoneNo: application.phoneNo,
      preferredDepartment: application.preferredDepartment,
      previousDegree: application.previousDegree,
      previousInstitution: application.previousInstitution,
      previousPassingYear: application.previousPassingYear,
      previousPercentage: Number(application.percentage.toString()),
    },
    mode: "onChange",
  });

  function onSubmit(values: UpdateMyApplicationInput) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateMyApplication(application.id, values)
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(`/my-applications/${application.id}`);
    });
  }

  return (
    <form id="edit-my-application-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-fullName">Full Name</FieldLabel>
                <Input
                  id="edit-app-fullName"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-gender">Gender</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="edit-app-gender" className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Gender).map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
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
            name="dateOfBirth"
            label="Date of Birth"
            calendarProps={{
              captionLayout: "dropdown",
              fromYear: new Date().getFullYear() - 30,
              toYear: new Date().getFullYear() - 18,
            }}
          />

          <Controller
            control={form.control}
            name="phoneNo"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-phoneNo">Phone Number</FieldLabel>
                <Input
                  id="edit-app-phoneNo"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-address">Address</FieldLabel>
                <Input
                  id="edit-app-address"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-city">City</FieldLabel>
                <Input
                  id="edit-app-city"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="preferredDepartment"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-department">
                  Department
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="edit-app-department" className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Department).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
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
            name="previousDegree"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-previousDegree">
                  Previous Degree
                </FieldLabel>
                <Input
                  id="edit-app-previousDegree"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="previousInstitution"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-previousInstitution">
                  Previous Institution
                </FieldLabel>
                <Input
                  id="edit-app-previousInstitution"
                  value={field.value}
                  onChange={field.onChange}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="previousPassingYear"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-previousPassingYear">
                  Previous Passing Year
                </FieldLabel>
                <Input
                  id="edit-app-previousPassingYear"
                  type="number"
                  min={1980}
                  max={new Date().getFullYear()}
                  step={1}
                  value={field.value || ""}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        ? Number(event.target.value)
                        : undefined
                    )
                  }
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="previousPercentage"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-app-previousPercentage">
                  Previous Percentage
                </FieldLabel>
                <Input
                  id="edit-app-previousPercentage"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={field.value || ""}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        ? Number(event.target.value)
                        : undefined
                    )
                  }
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button
          disabled={isPending}
          type="submit"
          form="edit-my-application-form"
        >
          {isPending ? "Updating..." : "Update Application"}
        </Button>
      </Field>
    </form>
  );
}
