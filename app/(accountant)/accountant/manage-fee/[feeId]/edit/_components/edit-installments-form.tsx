"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/tryCatch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { AccountantGetFeeForEditInstallmentsType } from "@/app/data/accountant/get-fee-for-edit-installments";
import {
  accountantEditInstallmentsSchema,
  type AccountantEditInstallmentsSchemaType,
} from "../schema";
import { accountantUpsertFeeInstallments } from "../actions";
import { FeeInstallmentsFormFields } from "@/app/(accountant)/accountant/_components/fee-installments-form-fields";

/// Edit fee installments form with prefilled defaults from current installment records.
export function EditInstallmentsForm({
  fee,
}: {
  fee: AccountantGetFeeForEditInstallmentsType;
}) {
  const [isPending, startTransition] = useTransition();

  const firstInstallment = fee.feeInstallments.find(
    (installment) => installment.installmentNo === 1
  );
  const secondInstallment = fee.feeInstallments.find(
    (installment) => installment.installmentNo === 2
  );

  const hasInstallments = fee.feeInstallments.length > 0;

  const form = useForm<AccountantEditInstallmentsSchemaType>({
    resolver: zodResolver(accountantEditInstallmentsSchema),
    defaultValues: {
      totalAmount: fee.totalAmount,
      makeInstallments: true,
      installments: {
        firstInstallmentAmount: hasInstallments
          ? firstInstallment?.amount
          : undefined,
        firstInstallmentDueDate: hasInstallments
          ? firstInstallment?.dueDate
          : undefined,
        firstInstallmentDescription: hasInstallments
          ? (firstInstallment?.description ?? "")
          : "",
        secondInstallmentDescription: hasInstallments
          ? (secondInstallment?.description ?? "")
          : "",
      },
    },
    mode: "onChange",
  });

  function onSubmit(values: AccountantEditInstallmentsSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        accountantUpsertFeeInstallments(fee.id, values)
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
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="edit-installments-total-amount">
                Total Fee
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="edit-installments-total-amount"
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FeeInstallmentsFormFields
          form={form}
          showToggle={false}
          forceVisible
        />

        <div className="flex flex-row gap-2 sm:gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset form
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Saving...
              </>
            ) : (
              "Save installments"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
