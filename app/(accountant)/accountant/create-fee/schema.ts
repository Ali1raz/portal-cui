import {
  SemesterFeeStatus,
  FinePolicyType,
} from "@/lib/generated/prisma/enums";
import z from "zod";

export const feeInstallmentSchema = z
  .object({
    firstInstallmentAmount: z
      .number()
      .int()
      .positive("First installment must be greater than 0"),
    firstInstallmentDueDate: z.date({
      message: "Please select a due date for first installment",
    }),
    firstInstallmentDescription: z.string().optional(),
    secondInstallmentDescription: z.string().optional(),
    fineType: z.nativeEnum(FinePolicyType).nullable().optional(),
    fineAmount: z
      .number()
      .positive("Fine amount must be greater than 0")
      .nullable()
      .optional(),
    fineMaxDays: z
      .number()
      .int()
      .min(1, "Max days must be at least 1")
      .nullable()
      .optional(),
    fineCapAmount: z
      .number()
      .positive("Fine cap must be greater than 0")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If fineType is set, fineAmount is required
      if (data.fineType && !data.fineAmount) {
        return false;
      }
      return true;
    },
    {
      message: "Fine amount is required when fine type is selected",
      path: ["fineAmount"],
    }
  )
  .refine(
    (data) => {
      // fineMaxDays only applies to PER_DAY
      if (data.fineType === "FIXED" && data.fineMaxDays) {
        return false;
      }
      return true;
    },
    {
      message: "Max days only applies to per-day fines",
      path: ["fineMaxDays"],
    }
  )
  .refine(
    (data) => {
      // fineCapAmount only applies to PER_DAY
      if (data.fineType && data.fineType !== "PER_DAY" && data.fineCapAmount) {
        return false;
      }
      return true;
    },
    {
      message: "Fine cap only applies to per-day fines",
      path: ["fineCapAmount"],
    }
  );

export const accountantCreateFeeSchema = z
  .object({
    totalAmount: z
      .number()
      .int()
      .positive("Total amount must be greater than 0"),
    semesterId: z.string().min(1, "Please select a semester"),
    description: z.string().optional(),
    status: z.nativeEnum(SemesterFeeStatus),
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
