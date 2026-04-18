import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import z from "zod";

export const feeInstallmentSchema = z.object({
  firstInstallmentAmount: z
    .number()
    .int()
    .positive("First installment must be greater than 0"),
  firstInstallmentDueDate: z.date({
    message: "Please select a due date for first installment",
  }),
  firstInstallmentDescription: z.string().optional(),
  secondInstallmentDescription: z.string().optional(),
});

export const accountantCreateFeeSchema = z
  .object({
    totalAmount: z
      .number()
      .int()
      .positive("Total amount must be greater than 0"),
    semesterId: z.string().min(1, "Please select a semester"),
    description: z.string().optional(),
    status: z.enum(SemesterFeeStatus),
    makeInstallments: z.boolean().optional(),
    installments: feeInstallmentSchema.optional(),
  })
  .refine(
    (data) => {
      if (!data.makeInstallments) return true;
      if (!data.installments) return false;
      // First installment should not exceed total
      return data.installments.firstInstallmentAmount <= data.totalAmount;
    },
    {
      message: "First installment amount cannot exceed total fee",
      path: ["installments", "firstInstallmentAmount"],
    }
  );

export type AccountantCreateFeeSchemaType = z.infer<
  typeof accountantCreateFeeSchema
>;
export type FeeInstallmentSchemaType = z.infer<typeof feeInstallmentSchema>;
