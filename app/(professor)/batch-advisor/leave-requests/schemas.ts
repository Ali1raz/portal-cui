import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { z } from "zod";

export const baLeaveRequestDecisionValues: LeaveStatus[] = [
  "HOD_PENDING",
  "REVIEW_REQUESTED",
  "REJECTED",
] as const;

export const baUpdateLeaveRequestStatusSchema = z
  .object({
    leaveRequestId: z.string().min(1),
    status: z.enum(baLeaveRequestDecisionValues),
    remarks: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const remarksRequired = value.status !== "HOD_PENDING";
    if (remarksRequired && !value.remarks?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["remarks"],
        message:
          "Remarks are required when rejecting or requesting more information.",
      });
    }
  });

export type BaUpdateLeaveRequestStatusInput = z.infer<
  typeof baUpdateLeaveRequestStatusSchema
>;
