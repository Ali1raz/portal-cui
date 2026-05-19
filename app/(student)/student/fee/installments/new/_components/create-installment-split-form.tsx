"use client";

import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

import {
  createInstallmentSplitRequestSchema,
  type CreateInstallmentSplitRequestSchemaType,
} from "../schema";
import { createInstallmentSplitRequest } from "../actions";
import type { StudentFeeSplitContextType } from "@/app/data/student/st-get-installment-split-options";

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function CreateInstallmentSplitForm({
  splitContext,
}: {
  splitContext: NonNullable<StudentFeeSplitContextType>;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const defaultValues = {
    splitAmount: undefined,
    preferredDueDate: getTomorrowDate(),
    reason: "",
  };

  const form = useForm<CreateInstallmentSplitRequestSchemaType>({
    resolver: zodResolver(
      createInstallmentSplitRequestSchema(splitContext.remainingAmount)
    ),
    defaultValues,
    mode: "onChange",
  });

  const splitAmount =
    useWatch({
      control: form.control,
      name: "splitAmount",
    }) ?? 0;

  const secondInstallmentAmount = Math.max(
    splitContext.remainingAmount - splitAmount,
    0
  );

  function onSubmit(values: CreateInstallmentSplitRequestSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        createInstallmentSplitRequest(values)
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
      form.reset(defaultValues);
      router.push("/student/fee");
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="mb-6 rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground">Current fee</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {splitContext.semesterLabel}
        </p>
        <p className="mt-2 text-sm">
          Available amount to split:{" "}
          {formatFeeAmount(splitContext.remainingAmount)}
        </p>
      </div>

      <form
        id="create-installment-split-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="splitAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="split-amount">Split Amount</FieldLabel>
                <Input
                  {...field}
                  id="split-amount"
                  type="number"
                  step={50}
                  placeholder="Enter amount"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value
                        ? parseInt(event.target.value, 10)
                        : undefined
                    );
                  }}
                  max={Math.max(splitContext.remainingAmount - 1, 0)}
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
            <FieldLabel htmlFor="remaining-amount-after-split">
              Remaining Amount After Split
            </FieldLabel>
            <Input
              id="remaining-amount-after-split"
              type="number"
              value={secondInstallmentAmount > 0 ? secondInstallmentAmount : 0}
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
                <FieldLabel htmlFor="split-reason">Reason</FieldLabel>
                <Textarea
                  {...field}
                  id="split-reason"
                  placeholder="Explain why you need installment split"
                  rows={4}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <Field orientation="horizontal" className="mt-8 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button
          disabled={isPending}
          type="submit"
          form="create-installment-split-form"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin size-4" />
              Submitting...
            </>
          ) : (
            "Submit split Request"
          )}
        </Button>
      </Field>
    </div>
  );
}
