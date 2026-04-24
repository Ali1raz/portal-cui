"use client";

import { useMemo, useTransition } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FormDateField } from "@/components/general/form-calendar";
import { formatDate } from "@/lib/utils";
import { formatFeeAmount } from "@/lib/utils/fee-format";

import {
  createInstallmentSplitRequestSchema,
  type CreateInstallmentSplitRequestSchemaType,
} from "../schema";
import { createInstallmentSplitRequest } from "../actions";
import type { StudentInstallmentSplitOption } from "@/app/data/student/st-get-installment-split-options";

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function getDefaultFormValues(
  installmentOptions: StudentInstallmentSplitOption[]
) {
  return {
    feeInstallmentId: installmentOptions[0]?.feeInstallmentId ?? "",
    firstInstallmentAmount: undefined,
    preferredDueDate: getTomorrowDate(),
    reason: "",
  };
}

export function CreateInstallmentSplitForm({
  installmentOptions,
}: {
  installmentOptions: StudentInstallmentSplitOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const defaultValues = getDefaultFormValues(installmentOptions);

  const form = useForm<CreateInstallmentSplitRequestSchemaType>({
    resolver: zodResolver(createInstallmentSplitRequestSchema),
    defaultValues,
    mode: "onChange",
  });

  const installmentOptionById = useMemo(
    () =>
      new Map(
        installmentOptions.map((option) => [option.feeInstallmentId, option])
      ),
    [installmentOptions]
  );

  const selectedInstallmentId = useWatch({
    control: form.control,
    name: "feeInstallmentId",
  });
  const firstInstallmentAmount =
    useWatch({
      control: form.control,
      name: "firstInstallmentAmount",
    }) ?? 0;

  const selectedInstallment = installmentOptionById.get(selectedInstallmentId);

  const secondInstallmentAmount = selectedInstallment
    ? selectedInstallment.totalAmount - firstInstallmentAmount
    : 0;

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
      <form
        id="create-installment-split-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="feeInstallmentId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="first-installment">
                  First Installment
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="first-installment" className="w-full">
                    <SelectValue placeholder="Select first installment" />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((option) => (
                      <SelectItem
                        key={option.feeInstallmentId}
                        value={option.feeInstallmentId}
                      >
                        <span>
                          {option.semesterLabel} ·{" "}
                          {formatFeeAmount(option.amount)} - Due{" "}
                          {formatDate(option.dueDate)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="firstInstallmentAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="first-installment-amount">
                  New First Installment Amount
                </FieldLabel>
                <Input
                  {...field}
                  id="first-installment-amount"
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
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Field>
            <FieldLabel htmlFor="second-installment-amount">
              New remaining Amount
            </FieldLabel>
            <Input
              id="second-installment-amount"
              type="number"
              value={secondInstallmentAmount > 0 ? secondInstallmentAmount : 0}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <FieldDescription>Automatically calculated.</FieldDescription>
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

      <Field orientation="horizontal" className="justify-end space-x-2 mt-8">
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
