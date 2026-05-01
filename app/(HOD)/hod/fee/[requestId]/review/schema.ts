import { z } from "zod";

export const hodReviewSplitRequestSchema = z
  .object({
    status: z.enum(["HOD_APPROVED", "HOD_REJECTED", "HOD_REVIEW_REQUESTED"]),
    remarks: z.string().max(600, "Remarks should be 600 chars or less."),
  })
  .superRefine(({ status, remarks }, ctx) => {
    const requiresRemarks =
      status === "HOD_REJECTED" || status === "HOD_REVIEW_REQUESTED";

    if (requiresRemarks && !remarks.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remarks are required for this decision.",
        path: ["remarks"],
      });
    }
  });

export type HodReviewSplitRequestSchemaType = z.infer<
  typeof hodReviewSplitRequestSchema
>;
