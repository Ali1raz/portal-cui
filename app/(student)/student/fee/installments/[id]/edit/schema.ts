import z from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const updateInstallmentSplitRequestSchema = z
  .object({
    splitAmount: z
      .number()
      .int()
      .positive("Split amount must be greater than 0"),
    preferredDueDate: z.date({
      message: "Please select a preferred due date",
    }),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine((data) => data.preferredDueDate >= today, {
    path: ["preferredDueDate"],
    message: "Preferred due date cannot be in the past",
  });

export type UpdateInstallmentSplitRequestSchemaType = z.infer<
  typeof updateInstallmentSplitRequestSchema
>;
