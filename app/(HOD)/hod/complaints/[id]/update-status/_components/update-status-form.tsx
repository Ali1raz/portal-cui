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
import { formatEnumLabel } from "@/lib/utils";
import { tryCatch } from "@/hooks/tryCatch";
import { updateComplaintStatus } from "../../actions";
import { useTransition } from "react";

type UpdateStatusFormData = {
  status: ComplaintStatus;
  hodRemarks: string;
};

/// Form for updating complaint status and remarks.
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

  const { control, handleSubmit } = useForm<UpdateStatusFormData>({
    defaultValues: {
      status: currentStatus,
      hodRemarks: currentRemarks || "",
    },
  });

  async function onSubmit(data: UpdateStatusFormData) {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        updateComplaintStatus(complaintId, data.status, data.hodRemarks)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ComplaintStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatEnumLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="hodRemarks"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="hodRemarks">HOD Remarks</FieldLabel>
              <Textarea
                {...field}
                id="hodRemarks"
                placeholder="Enter your remarks here..."
                rows={6}
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Field orientation="horizontal" className="justify-end space-x-2 mt-6">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push(`/hod/complaints/${complaintId}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Status"}
        </Button>
      </Field>
    </form>
  );
}
