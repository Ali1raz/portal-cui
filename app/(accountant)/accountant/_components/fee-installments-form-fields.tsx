"use client";

import {
  useWatch,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDateField } from "@/components/general/form-calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { FeeInstallmentSchemaType } from "@/app/(accountant)/accountant/create-fee/schema";

type FeeInstallmentsFormFieldsProps<
  TFormValues extends {
    makeInstallments?: boolean;
    totalAmount?: number;
    installments?: FeeInstallmentSchemaType;
  },
> = {
  form: UseFormReturn<TFormValues>;
  showToggle?: boolean;
  forceVisible?: boolean;
  showFinePolicy?: boolean;
};

/// Reusable installments fields shared by create-fee and edit-installments forms.
export function FeeInstallmentsFormFields<TFormValues extends FieldValues>({
  form,
  showToggle = true,
  forceVisible = false,
  showFinePolicy = true,
}: FeeInstallmentsFormFieldsProps<TFormValues>) {
  const internalForm = form as unknown as UseFormReturn<FieldValues>;

  const makeInstallmentsEnabled = useWatch({
    control: internalForm.control,
    name: "makeInstallments",
  });

  const totalAmount = useWatch({
    control: internalForm.control,
    name: "totalAmount",
  }) as number | undefined;

  const firstInstallmentAmount = useWatch({
    control: internalForm.control,
    name: "installments.firstInstallmentAmount",
  }) as number | undefined;

  const firstInstallmentDueDate = useWatch({
    control: internalForm.control,
    name: "installments.firstInstallmentDueDate",
  }) as Date | undefined;

  const showInstallmentsSection =
    forceVisible || makeInstallmentsEnabled === true;

  return (
    <Card className="space-y-4 rounded">
      {showToggle ? (
        <CardHeader className="flex items-center gap-2">
          <Checkbox
            id="make-installments"
            checked={makeInstallmentsEnabled === true}
            onCheckedChange={(checked) => {
              const enabled = checked === true;
              internalForm.setValue("makeInstallments", enabled, {
                shouldValidate: true,
                shouldDirty: true,
              });

              if (!enabled) {
                internalForm.setValue("installments", undefined, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            }}
          />
          <FormLabel htmlFor="make-installments" className="cursor-pointer">
            Make Installments
          </FormLabel>
        </CardHeader>
      ) : (
        <CardHeader>
          <p className="font-medium">Installments</p>
          <p className="text-sm text-muted-foreground">
            Split total fee into two installments. Second installment amount is
            auto-calculated.
          </p>
        </CardHeader>
      )}

      {showInstallmentsSection ? (
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 w-full sm:gap-4 gap-2 items-baseline">
            <FormField
              control={internalForm.control}
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
                        field.onChange(value ? parseInt(value, 10) : undefined);
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
            control={internalForm.control}
            name="installments.firstInstallmentDueDate"
            label="1st Installment Due Date"
            hint="Select due date"
            calendarProps={{}}
          />

          {showFinePolicy && !!firstInstallmentDueDate && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Late Fee Policy (Optional)</h3>

              <FormField
                control={internalForm.control}
                name="installments.fineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fine Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "null" ? null : value)
                        }
                        value={field.value ?? "null"}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="null" id="fine-none" />
                          <Label htmlFor="fine-none">No Fine</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FIXED" id="fine-fixed" />
                          <Label htmlFor="fine-fixed">
                            Fixed (one-time charge)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PER_DAY" id="fine-per-day" />
                          <Label htmlFor="fine-per-day">
                            Per Day (daily rate)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {internalForm.watch("installments.fineType") && (
                <>
                  <FormField
                    control={internalForm.control}
                    name="installments.fineAmount"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel htmlFor="fine-amount">
                          {internalForm.watch("installments.fineType") ===
                          "FIXED"
                            ? "Flat Charge (PKR)"
                            : "Daily Rate (PKR)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="fine-amount"
                            type="number"
                            placeholder="500"
                            value={field.value ?? ""}
                            step={10}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(internalForm.watch("installments.fineType") as string) ===
                    "PER_DAY" && (
                    <>
                      <FormField
                        control={internalForm.control}
                        name="installments.fineMaxDays"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel htmlFor="fine-max-days">
                              Max Days Charged (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="fine-max-days"
                                type="number"
                                placeholder="30"
                                value={field.value ?? ""}
                                min={1}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : null
                                  )
                                }
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Leave empty for unlimited
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={internalForm.control}
                        name="installments.fineCapAmount"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel htmlFor="fine-cap-amount">
                              Fine Cap (PKR) (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="fine-cap-amount"
                                type="number"
                                placeholder="e.g. 5000"
                                value={field.value ?? ""}
                                step={10}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : null
                                  )
                                }
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Maximum total fine amount
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <FormField
            control={internalForm.control}
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
            control={internalForm.control}
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
      ) : null}
    </Card>
  );
}
