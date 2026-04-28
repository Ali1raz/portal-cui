"use client";

import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { tryCatch } from "@/hooks/tryCatch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormDateField } from "@/components/general/form-calendar";
import { formatFeeAmount } from "@/lib/utils/fee-format";
import type { StudentInstallmentSplitRequestForEdit } from "@/app/data/student/st-get-installment-split-request-for-edit";

import { updateInstallmentSplitRequest } from "../actions";
import {
  updateInstallmentSplitRequestSchema,
  type UpdateInstallmentSplitRequestSchemaType,
} from "../schema";

export function EditInstallmentSplitForm({
  request,
}: {
  request: StudentInstallmentSplitRequestForEdit;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateInstallmentSplitRequestSchemaType>({
    resolver: zodResolver(updateInstallmentSplitRequestSchema),
    defaultValues: {
      splitAmount: request.requestedAmount,
      preferredDueDate: new Date(request.preferredDueDate),
      reason: request.reason,
    },
    mode: "onChange",
  });

  const splitAmount =
    useWatch({
      control: form.control,
      name: "splitAmount",
    }) ?? 0;

  const remainingAfterSplit = Math.max(
    request.feeContext.remainingAmount - splitAmount,
    0
  );

  function onSubmit(values: UpdateInstallmentSplitRequestSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateInstallmentSplitRequest(request.id, values)
      );

      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/student/fee/installments");
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <form
      id="edit-installment-split-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">Current fee</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.feeContext.semesterLabel}
          </p>
          <p className="mt-2 text-sm">
            Available amount to split:{" "}
            {formatFeeAmount(request.feeContext.remainingAmount)}
          </p>
        </div>

        <Controller
          name="splitAmount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="edit-split-amount">Split Amount</FieldLabel>
              <Input
                {...field}
                id="edit-split-amount"
                type="number"
                step={50}
                value={field.value ?? ""}
                onChange={(event) => {
                  field.onChange(
                    event.target.value
                      ? parseInt(event.target.value, 10)
                      : undefined
                  );
                }}
                max={Math.max(request.feeContext.remainingAmount - 1, 0)}
              />
              <FieldDescription>
                Must be less than the available fee balance.
              </FieldDescription>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor="edit-remaining-after-split">
            Remaining Amount After Split
          </FieldLabel>
          <Input
            id="edit-remaining-after-split"
            type="number"
            value={remainingAfterSplit}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <FieldDescription>
            Automatically calculated from the available fee balance.
          </FieldDescription>
        </Field>

        <FormDateField
          control={form.control}
          name="preferredDueDate"
          label="Preferred Due Date"
          calendarProps={{
            disabled: {
              before: today,
            },
          }}
        />

        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="edit-split-reason">Reason</FieldLabel>
              <Textarea
                {...field}
                id="edit-split-reason"
                rows={4}
                placeholder="Explain why you need installment split"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <Field orientation="horizontal" className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button
          disabled={isPending}
          type="submit"
          form="edit-installment-split-form"
        >
          {isPending ? "Updating..." : "Update Request"}
        </Button>
      </Field>
    </form>
  );
}
