import z from "zod";
import { feeInstallmentSchema } from "@/app/(accountant)/accountant/create-fee/schema";

export const hodEditInstallmentsSchema = z
  .object({
    totalAmount: z
      .number()
      .int()
      .positive("Total amount must be greater than 0"),
    makeInstallments: z.boolean().optional(),
    installments: feeInstallmentSchema,
  })
  .refine(
    (data) => data.installments.firstInstallmentAmount <= data.totalAmount,
    {
      message: "First installment amount cannot exceed total fee",
      path: ["installments", "firstInstallmentAmount"],
    }
  );

export type HodEditInstallmentsSchemaType = z.infer<
  typeof hodEditInstallmentsSchema
>;
