"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { PopoverTrigger, PopoverContent, Popover } from "../ui/popover";
import { Button } from "../ui/button";
import { formatDate } from "@/lib/utils";
import type { DayPicker } from "react-day-picker";
import type { ComponentProps } from "react";

type CalendarProps = Omit<
  ComponentProps<typeof DayPicker>,
  "mode" | "selected" | "onSelect"
>;

export function FormDateField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  calendarProps,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  hint?: string;
  calendarProps?: CalendarProps;
}) {
  const fieldId = `${name}-form`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={fieldId} className="items-center gap-1.5">
            <span>{label}</span>
            {hint ? (
              <span className="text-xs text-muted-foreground">({hint})</span>
            ) : null}
          </FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={fieldId}
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
              >
                {field.value ? (
                  formatDate(field.value)
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
                <CalendarIcon className="size-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value as Date | undefined}
                onSelect={(date) => field.onChange(date)}
                {...calendarProps}
              />
            </PopoverContent>
          </Popover>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
