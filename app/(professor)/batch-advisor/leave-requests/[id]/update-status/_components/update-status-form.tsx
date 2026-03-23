/* eslint-disable react-hooks/incompatible-library */
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/hooks/tryCatch";
import { LeaveStatus } from "@/lib/generated/prisma/enums";

import { baUpdateLeaveRequestStatus } from "../../../actions";
import {
  baUpdateLeaveRequestStatusSchema,
  type BaUpdateLeaveRequestStatusInput,
} from "../../../schemas";

export function UpdateStatusForm({
  leaveRequestId,
}: {
  leaveRequestId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, watch } =
    useForm<BaUpdateLeaveRequestStatusInput>({
      resolver: zodResolver(baUpdateLeaveRequestStatusSchema),
      defaultValues: {
        leaveRequestId,
        status: LeaveStatus.HOD_PENDING,
        remarks: "",
      },
    });

  const selectedStatus = watch("status");
  const remarksRequired = selectedStatus !== LeaveStatus.HOD_PENDING;

  async function onSubmit(values: BaUpdateLeaveRequestStatusInput) {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        baUpdateLeaveRequestStatus(values)
      );

      if (error || response?.status === "error") {
        toast.error(response?.message ?? "Failed to update leave request");
        return;
      }

      toast.success(response.message);
      router.push(`/batch-advisor/leave-requests/${leaveRequestId}`);
    });
  }

  return (
    <form id="ba-update-lr-form" onSubmit={handleSubmit(onSubmit)}>
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
                  <SelectItem value={LeaveStatus.HOD_PENDING}>
                    Accept — Forward to HOD
                  </SelectItem>
                  <SelectItem value={LeaveStatus.REVIEW_REQUESTED}>
                    Request More Information
                  </SelectItem>
                  <SelectSeparator />
                  <SelectItem value={LeaveStatus.REJECTED}>
                    Reject Leave Request
                  </SelectItem>
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
                  : "Optional notes for HOD"}
              </p>
              <Textarea
                {...field}
                id="remarks"
                rows={5}
                placeholder={
                  remarksRequired
                    ? "Add reason/required changes for the student…"
                    : "Add optional context for HOD…"
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
          variant={
            selectedStatus === LeaveStatus.REJECTED ? "destructive" : "default"
          }
        >
          {isPending
            ? "Submitting…"
            : selectedStatus === LeaveStatus.REJECTED
              ? "Reject"
              : selectedStatus === LeaveStatus.REVIEW_REQUESTED
                ? "Request More Info"
                : "Forward to HOD"}
        </Button>
      </Field>
    </form>
  );
}
