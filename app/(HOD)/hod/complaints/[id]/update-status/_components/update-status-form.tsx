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
import { updateComplaintStatus } from "../../actions";
import { useTransition } from "react";

type UpdateStatusFormData = {
  status: "HOD_ACCEPTED" | "HOD_REJECTED";
  hodRemarks: string;
};

const ALREADY_REVIEWED: ComplaintStatus[] = [
  ComplaintStatus.HOD_ACCEPTED,
  ComplaintStatus.HOD_REJECTED,
];

/// Form for updating complaint status by HOD.
export function UpdateComplaintStatusForm({
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

  const alreadyReviewed = ALREADY_REVIEWED.includes(currentStatus);

  const { control, handleSubmit, watch } = useForm<UpdateStatusFormData>({
    defaultValues: {
      status: "HOD_ACCEPTED",
      hodRemarks: currentRemarks ?? "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedStatus = watch("status");
  const isRejecting = selectedStatus === "HOD_REJECTED";

  async function onSubmit(data: UpdateStatusFormData) {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        updateComplaintStatus(
          complaintId,
          data.status as ComplaintStatus,
          data.hodRemarks
        )
      );

      if (error || response?.status === "error") {
        toast.error(response?.message ?? "Failed to update status");
        return;
      }

      toast.success(response.message);
      router.push(`/hod/complaints/${complaintId}`);
      router.refresh();
    });
  }

  if (alreadyReviewed) {
    return (
      <div className="rounded-md border border-muted bg-muted/30 p-4 text-sm text-muted-foreground">
        This complaint has already been reviewed and cannot be updated.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                  <SelectItem value={ComplaintStatus.HOD_ACCEPTED}>
                    Accept — Resolve Complaint
                  </SelectItem>
                  <SelectItem value={ComplaintStatus.HOD_REJECTED}>
                    Reject — Dismiss Complaint
                  </SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="hodRemarks"
          control={control}
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
              <FieldLabel htmlFor="hodRemarks">
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
                id="hodRemarks"
                placeholder={
                  isRejecting
                    ? "Explain why this complaint is being rejected..."
                    : "Add any remarks for the student (optional)..."
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
          onClick={() => router.push(`/hod/complaints/${complaintId}`)}
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
              ? "Reject Complaint"
              : "Accept & Resolve"}
        </Button>
      </Field>
    </form>
  );
}
