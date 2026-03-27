/* eslint-disable react-hooks/incompatible-library */
"use client";

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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/hooks/tryCatch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { clerkUpdateApplicationStatus } from "../../../actions";
import {
  clerkUpdateApplicationStatusSchema,
  type ClerkUpdateApplicationStatusInput,
} from "../../../schemas";

export function ClerkApplicationUpdateStatusForm({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, watch } =
    useForm<ClerkUpdateApplicationStatusInput>({
      resolver: zodResolver(clerkUpdateApplicationStatusSchema),
      defaultValues: {
        applicationId,
        status: "APPROVED",
        remarks: "",
      },
    });

  const selectedStatus = watch("status");
  const remarksRequired =
    selectedStatus === "REVIEW_REQUESTED" || selectedStatus === "REJECTED";

  async function onSubmit(values: ClerkUpdateApplicationStatusInput) {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        clerkUpdateApplicationStatus(values)
      );

      if (error || response?.status === "error") {
        toast.error(response?.message ?? "Failed to update application");
        return;
      }

      toast.success(response.message);
      router.push(`/clerk/applications/${applicationId}`);
    });
  }

  return (
    <form id="clerk-update-app-form" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="status"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="status">Decision</FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Accept Application</SelectItem>
                  <SelectItem value="REVIEW_REQUESTED">
                    Request More Information
                  </SelectItem>
                  <SelectSeparator />
                  <SelectItem value="REJECTED">Reject Application</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="remarks"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="remarks">
                Remarks
                {remarksRequired ? (
                  <span className="text-destructive ml-1">*</span>
                ) : null}
              </FieldLabel>
              <p className="text-xs text-muted-foreground mb-2">
                {remarksRequired
                  ? "Required for rejection or requesting more information"
                  : "Optional notes when approving"}
              </p>
              <Textarea
                {...field}
                id="remarks"
                rows={5}
                placeholder={
                  remarksRequired
                    ? "Add reason/required changes for the student…"
                    : "Add optional approval context…"
                }
                disabled={isPending}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <Field orientation="horizontal" className="justify-end w-full mt-6">
        <Button
          type="submit"
          disabled={isPending}
          variant={selectedStatus === "REJECTED" ? "destructive" : "default"}
        >
          {isPending
            ? "Submitting…"
            : selectedStatus === "REJECTED"
              ? "Reject"
              : selectedStatus === "REVIEW_REQUESTED"
                ? "Request for update application"
                : "Accept"}
        </Button>
      </Field>
    </form>
  );
}
