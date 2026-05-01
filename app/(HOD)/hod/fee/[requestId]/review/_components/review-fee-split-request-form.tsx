"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { tryCatch } from "@/hooks/tryCatch";
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
import { Textarea } from "@/components/ui/textarea";
import { hodReviewSplitRequest } from "../../actions";
import {
  hodReviewSplitRequestSchema,
  type HodReviewSplitRequestSchemaType,
} from "../schema";

export function ReviewFeeSplitRequestForm({
  requestId,
}: {
  requestId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { control, handleSubmit } = useForm<HodReviewSplitRequestSchemaType>({
    resolver: zodResolver(hodReviewSplitRequestSchema),
    defaultValues: {
      status: "HOD_APPROVED",
      remarks: "",
    },
  });

  const selectedStatus = useWatch({ control, name: "status" });
  const needsRemarks =
    selectedStatus === "HOD_REJECTED" ||
    selectedStatus === "HOD_REVIEW_REQUESTED";

  function onSubmit(values: HodReviewSplitRequestSchemaType) {
    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        hodReviewSplitRequest(requestId, values)
      );

      if (error || !response) {
        toast.error("Failed to update request.");
        return;
      }

      if (response.status === "error") {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push("/hod/fee");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                  <SelectValue placeholder="Select a decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOD_APPROVED">
                    Approve and forward
                  </SelectItem>
                  <SelectItem value="HOD_REVIEW_REQUESTED">
                    Request update
                  </SelectItem>
                  <SelectItem value="HOD_REJECTED">Reject request</SelectItem>
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
                {needsRemarks ? (
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
                rows={6}
                placeholder={
                  needsRemarks
                    ? "Explain the required update or reason for rejection..."
                    : "Add optional remarks for the next reviewer..."
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

      <Field orientation="horizontal" className="justify-end mt-6 space-x-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push("/hod/fee")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Decision"}
        </Button>
      </Field>
    </form>
  );
}
