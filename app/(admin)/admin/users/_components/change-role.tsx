"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { tryCatch } from "@/hooks/tryCatch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Department, Program, Role } from "@/lib/generated/prisma/enums";
import { ASSIGNABLE_ROLES, formatEnumLabel } from "@/lib/utils";
import { setUserRole } from "../actions";
import {
  changeUserRoleSchema,
  type ChangeUserRoleFormValues,
  type ChangeUserRoleTarget,
} from "../user-role-form-schema";

export function ChangeUserRoleDialog({
  children,
  user,
}: {
  children?: React.ReactNode;
  user?: ChangeUserRoleTarget;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  // Compute safe default values even when `user` is undefined so hooks
  // (useForm, useWatch, useMemo) run unconditionally and maintain hook order.
  const defaultValues = useMemo<ChangeUserRoleFormValues>(() => {
    return {
      role: user?.role ?? Role.USER,
      professorDepartment:
        user?.professor?.department ?? user?.hod?.department ?? undefined,
      professorPrograms: user?.professor?.programs ?? [],
      hodDepartment:
        user?.hod?.department ?? user?.professor?.department ?? undefined,
    };
  }, [user]);

  const form = useForm<ChangeUserRoleFormValues>({
    // cast resolver to the proper Resolver type to satisfy linter/types
    resolver: zodResolver(
      changeUserRoleSchema
    ) as unknown as Resolver<ChangeUserRoleFormValues>,
    defaultValues,
  });

  const selectedRole = useWatch({ control: form.control, name: "role" });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  function handleChange(values: ChangeUserRoleFormValues) {
    startTransition(async () => {
      if (!user?.id) {
        toast.error("User data not available. Cannot change role.");
        return;
      }

      const { data: result, error } = await tryCatch(
        setUserRole(user.id, {
          role: values.role,
          professorDepartment: values.professorDepartment,
          professorPrograms: values.professorPrograms,
          hodDepartment: values.hodDepartment,
        })
      );

      if (error) {
        toast.error("Something went wrong.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            Change user role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle>
            {user?.name ? `Change role for ${user.name}` : "Change role"}
          </DialogTitle>
          <DialogDescription>
            Current user role is{" "}
            <span className="font-extrabold">
              {user?.role ? formatEnumLabel(user.role) : "—"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <form
          id="change-user-role-form"
          onSubmit={form.handleSubmit(handleChange)}
        >
          <FieldGroup>
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="change-user-role-form-role">
                    Role
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as Role)}
                  >
                    <SelectTrigger
                      id="change-user-role-form-role"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ASSIGNABLE_ROLES).map((role) => (
                        <SelectItem key={role} value={role}>
                          {formatEnumLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {selectedRole === Role.PROFESSOR ? (
              <FieldGroup>
                <Controller
                  name="professorDepartment"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="change-user-role-form-professor-department">
                        Professor Department
                      </FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value ? (value as Department) : undefined
                          )
                        }
                      >
                        <SelectTrigger
                          id="change-user-role-form-professor-department"
                          aria-invalid={fieldState.invalid}
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
                  name="professorPrograms"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FieldSet>
                      <FieldLegend>Professor Programs</FieldLegend>
                      <FieldDescription>
                        Select one or more programs for this professor.
                      </FieldDescription>
                      <Field data-invalid={fieldState.invalid}>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="justify-start"
                          value={field.value}
                          onValueChange={(values) =>
                            field.onChange(values as Program[])
                          }
                        >
                          <ToggleGroupItem value={Program.B}>
                            Bachelor
                          </ToggleGroupItem>
                          <ToggleGroupItem value={Program.M}>
                            Master
                          </ToggleGroupItem>
                        </ToggleGroup>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    </FieldSet>
                  )}
                />
              </FieldGroup>
            ) : null}

            {selectedRole === Role.HOD ? (
              <FieldGroup>
                <Controller
                  name="hodDepartment"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="change-user-role-form-hod-department">
                        HOD Department
                      </FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value ? (value as Department) : undefined
                          )
                        }
                      >
                        <SelectTrigger
                          id="change-user-role-form-hod-department"
                          aria-invalid={fieldState.invalid}
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
              </FieldGroup>
            ) : null}
          </FieldGroup>
        </form>
        <DialogFooter className="w-full">
          <Button
            disabled={isPending}
            type="submit"
            form="change-user-role-form"
            variant="destructive"
          >
            {isPending ? "Saving..." : "Confirm"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
