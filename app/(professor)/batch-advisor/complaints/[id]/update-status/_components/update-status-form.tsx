"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
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

type UpdateStatusFormData = {
  status: "HOD_PENDING" | "BA_REJECTED"; // FIX 1: only valid BA actions, no BA_PENDING
  remarks: string;
};

const ALREADY_REVIEWED: ComplaintStatus[] = [
  ComplaintStatus.BA_REJECTED,
  ComplaintStatus.HOD_PENDING,
  ComplaintStatus.HOD_ACCEPTED,
  ComplaintStatus.HOD_REJECTED,
  ComplaintStatus.REASSIGNED,
];

export function BaUpdateComplaintStatusForm({
  complaintId,
  currentStatus,
  currentRemarks,
}: {
  complaintId: string;
  currentStatus: ComplaintStatus;
  currentRemarks?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // FIX 3: if already reviewed, render read-only summary instead of the form
  const alreadyReviewed = ALREADY_REVIEWED.includes(currentStatus);

  const { control, handleSubmit, watch } = useForm<UpdateStatusFormData>({
    defaultValues: {
      status: "HOD_PENDING", // default to Accept — more common action
      remarks: currentRemarks ?? "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStatus = watch("status");
  const isRejecting = selectedStatus === "BA_REJECTED";

  async function onSubmit(data: UpdateStatusFormData) {
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
      router.refresh();
    });
  }

  // FIX 3: already reviewed — show read-only state, no form
  if (alreadyReviewed) {
    return (
      <div className="rounded-md border border-muted bg-muted/30 p-4 text-sm text-muted-foreground">
        This complaint has already been reviewed and cannot be updated.
      </div>
    );
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
                {/* FIX 1: only Accept or Reject — BA_PENDING removed */}
                <SelectContent>
                  <SelectItem value={ComplaintStatus.HOD_PENDING}>
                    Accept — Forward to HOD
                  </SelectItem>
                  <SelectItem value={ComplaintStatus.BA_REJECTED}>
                    Ask for Revision
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
          // FIX 2: required when rejecting, optional when accepting
          rules={{
            validate: (value) => {
              if (isRejecting && !value?.trim()) {
                return "Remarks are required when rejecting a complaint";
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="remarks">
                Remarks
                {isRejecting ? (
                  <span className="text-destructive ml-1">*</span>
                ) : (
                  <span className="text-muted-foreground text-xs ml-2">
                    (optional)
                  </span>
                )}
              </FieldLabel>
              <Textarea
                {...field}
                id="remarks"
                placeholder={
                  isRejecting
                    ? "Explain why this complaint needs revision..."
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
          variant={isRejecting ? "destructive" : "default"}
        >
          {isPending
            ? "Submitting..."
            : isRejecting
              ? "Ask for Revision"
              : "Accept & Forward to HOD"}
        </Button>
      </Field>
    </form>
  );
}
