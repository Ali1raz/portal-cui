"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Department, Gender } from "@/lib/generated/prisma/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { applyFormSchema, ApplyFormSchemaType } from "../schema";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/tryCatch";
import { submitApplication } from "../apply/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDateField } from "@/components/general/form-calendar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter } from "next/navigation";

interface iAppProps {
  id: string;
  department: Department | null;
}

export function ApplyForm({ department, id }: iAppProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [savedForm, setSavedForm, clearSavedForm] = useLocalStorage<
    Partial<ApplyFormSchemaType>
  >("apply-form", {});

  const form = useForm<ApplyFormSchemaType>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      address: savedForm.address ?? "",
      city: savedForm.city ?? "",
      dateOfBirth: savedForm.dateOfBirth
        ? new Date(savedForm.dateOfBirth)
        : undefined,
      fullName: savedForm.fullName ?? "",
      gender: savedForm.gender ?? "MALE",
      phoneNo: savedForm.phoneNo ?? "",
      preferredDepartment: savedForm.preferredDepartment ?? department ?? "BA",
      previousDegree: savedForm.previousDegree ?? "",
      previousInstitution: savedForm.previousInstitution ?? "",
      previousPassingYear: savedForm.previousPassingYear ?? undefined,
      previousPercentage: savedForm.previousPercentage ?? undefined,
      semesterId: id,
    },
    mode: "onChange",
    resetOptions: { keepValues: true, keepDirty: false, keepErrors: false },
  });

  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    setSavedForm(formValues);
  }, [formValues, setSavedForm]);

  function onSubmit(values: ApplyFormSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(submitApplication(values));

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      clearSavedForm();
      router.push("/my-applications");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fill in following details</h1>
        <p className="text-muted-foreground text-sm">
          Please fill in the following details to apply for registration:
        </p>
      </div>

      <form
        id="apply-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="apply-form-fullName">
                    Full Name
                  </FieldLabel>
                  <Input
                    id="apply-form-fullName"
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
                  <FieldLabel htmlFor="apply-form-gender">Gender</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="apply-form-gender" className="w-full">
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
                  <FieldLabel htmlFor="apply-form-phoneNo">
                    Phone Number
                  </FieldLabel>
                  <Input
                    id="apply-form-phoneNo"
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
                  <FieldLabel htmlFor="apply-form-address">Address</FieldLabel>
                  <Input
                    id="apply-form-address"
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
                  <FieldLabel htmlFor="apply-form-city">City</FieldLabel>
                  <Input
                    id="apply-form-city"
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
                  <FieldLabel htmlFor="apply-form-department">
                    Department - {department}
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!department}
                  >
                    <SelectTrigger
                      id="apply-form-department"
                      className="w-full"
                    >
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
                  <FieldLabel htmlFor="apply-form-previousDegree">
                    Previous Degree
                  </FieldLabel>
                  <Input
                    id="apply-form-previousDegree"
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
                  <FieldLabel htmlFor="apply-form-previousInstitution">
                    Previous Institution
                  </FieldLabel>
                  <Input
                    id="apply-form-previousInstitution"
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
                  <FieldLabel htmlFor="apply-form-previousPassingYear">
                    Previous Passing Year
                  </FieldLabel>
                  <Input
                    id="apply-form-previousPassingYear"
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
                  <FieldLabel htmlFor="apply-form-previousPercentage">
                    Previous Percentage
                  </FieldLabel>
                  <Input
                    id="apply-form-previousPercentage"
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

        <Field orientation="horizontal" className="mt-12 justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button disabled={isPending} type="submit" form="apply-form">
            {isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </Field>
      </form>
    </div>
  );
}
