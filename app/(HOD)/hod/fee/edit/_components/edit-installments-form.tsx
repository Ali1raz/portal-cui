"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
import { Textarea } from "@/components/ui/textarea";
import { FormDateField } from "@/components/general/form-calendar";
import type { HodGetFeeForEditInstallmentsType } from "@/app/data/hod/get-fee-for-edit-installments";
import {
  hodEditInstallmentsSchema,
  type HodEditInstallmentsSchemaType,
} from "../schema";
import { hodUpsertFeeInstallments } from "../actions";
import { useRouter } from "next/navigation";

/// Edit fee installments form with prefilled defaults from current installment records.
export function EditInstallmentsForm({
  fee,
}: {
  fee: HodGetFeeForEditInstallmentsType;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const firstInstallment = fee.feeInstallments.find(
    (installment) => installment.installmentNo === 1
  );
  const secondInstallment = fee.feeInstallments.find(
    (installment) => installment.installmentNo === 2
  );

  const hasInstallments = fee.feeInstallments.length > 0;

  const form = useForm<HodEditInstallmentsSchemaType>({
    resolver: zodResolver(hodEditInstallmentsSchema),
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

  const totalAmount = useWatch({
    control: form.control,
    name: "totalAmount",
  }) as number | undefined;

  const firstInstallmentAmount = useWatch({
    control: form.control,
    name: "installments.firstInstallmentAmount",
  }) as number | undefined;

  function onSubmit(values: HodEditInstallmentsSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        hodUpsertFeeInstallments(fee.id, values)
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
      router.push("/hod/fee");
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
              <FormLabel htmlFor="hod-edit-installments-total-amount">
                Total Fee
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="hod-edit-installments-total-amount"
                  type="number"
                  step={50}
                  value={field.value ?? ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
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

        <Card className="space-y-4 rounded">
          <CardHeader>
            <p className="font-medium">Installments</p>
            <p className="text-sm text-muted-foreground">
              Split total fee into two installments. Second installment amount
              is auto-calculated.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 w-full sm:gap-4 gap-2 items-baseline">
              <FormField
                control={form.control}
                name="installments.firstInstallmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="first-installment-amount">
                      1st Installment Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="first-installment-amount"
                        type="number"
                        placeholder="Amount for first installment"
                        step={50}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(
                            value ? parseInt(value, 10) : undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel htmlFor="second-installment-amount">
                  2nd Installment Amount{" "}
                  <span className="text-xs text-muted-foreground">
                    (Automatically calculated)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="second-installment-amount"
                    type="number"
                    value={
                      totalAmount && firstInstallmentAmount
                        ? totalAmount - firstInstallmentAmount
                        : 0
                    }
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
              </FormItem>
            </div>

            <FormDateField
              control={form.control}
              name="installments.firstInstallmentDueDate"
              label="1st Installment Due Date"
              hint="Select due date"
              calendarProps={{}}
            />

            <FormField
              control={form.control}
              name="installments.firstInstallmentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="first-installment-desc">
                    1st Installment Description (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="first-installment-desc"
                      value={field.value ?? ""}
                      placeholder="Any details for first installment"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installments.secondInstallmentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="second-installment-desc">
                    2nd Installment Description (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="second-installment-desc"
                      value={field.value ?? ""}
                      placeholder="Any details for second installment"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
