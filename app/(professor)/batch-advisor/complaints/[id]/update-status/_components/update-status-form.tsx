/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import { tryCatch } from "@/hooks/tryCatch";
import { baUpdateComplaintStatus } from "../../../actions";
import { useTransition } from "react";
import { BaUpdateComplaintStatusInput } from "../../../schemas";

export function BaUpdateComplaintStatusForm({
  complaintId,
  // currentStatus,
}: {
  complaintId: string;
  currentStatus: ComplaintStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, watch } =
    useForm<BaUpdateComplaintStatusInput>({
      defaultValues: {
        status: "HOD_PENDING",
      },
    });

  const selectedStatus = watch("status");
  const remarksRequired = selectedStatus !== "HOD_PENDING";

  async function onSubmit(data: BaUpdateComplaintStatusInput) {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        baUpdateComplaintStatus({
          complaintId,
          status: data.status,
          remarks: data.remarks,
        })
      );

      if (error || response?.status === "error") {
        toast.error(response?.message ?? "Failed to update status");
        return;
      }

      toast.success(response.message);
      router.push(`/batch-advisor/complaints/${complaintId}`);
    });
  }

  return (
    <form id="update-status-form" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
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
                  <SelectGroup>
                    <SelectItem value={ComplaintStatus.HOD_PENDING}>
                      Accept — Forward to HOD
                    </SelectItem>
                    <SelectItem value={ComplaintStatus.BA_REVIEW_REQUESTED}>
                      Request Revision
                    </SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectItem value={ComplaintStatus.BA_REJECTED}>
                    Reject this complaint
                  </SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="remarks"
          control={control}
          rules={{
            validate: (value) => {
              if (remarksRequired && !value?.trim()) {
                return "Remarks are required when rejecting or requesting revision";
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="remarks">
                Remarks
                {remarksRequired && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FieldLabel>
              <p className="text-xs text-muted-foreground mb-2">
                {remarksRequired
                  ? "Required for rejection or revision requests"
                  : "Optional notes for the HOD"}
              </p>
              <Textarea
                {...field}
                id="remarks"
                placeholder={
                  remarksRequired
                    ? "Explain why you're rejecting or requesting revision..."
                    : "Add any remarks for the HOD (optional)..."
                }
                rows={6}
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Field
        orientation="horizontal"
        className="justify-end w-full space-x-2 mt-6"
      >
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            router.push(`/batch-advisor/complaints/${complaintId}`)
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          variant={selectedStatus === "BA_REJECTED" ? "destructive" : "default"}
        >
          {isPending
            ? "Submitting..."
            : selectedStatus === "BA_REJECTED"
              ? "Reject"
              : selectedStatus === "BA_REVIEW_REQUESTED"
                ? "Request Revision"
                : "Forward to HOD"}
        </Button>
      </Field>
    </form>
  );
}
