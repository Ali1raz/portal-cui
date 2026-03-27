import z from "zod";
import { StudentApplicationStatus } from "@/lib/generated/prisma/enums";

export const clerkUpdateApplicationStatusSchema = z
  .object({
    applicationId: z.string().min(1, "Application id is required."),
    status: z.enum(StudentApplicationStatus),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const remarksRequired =
      data.status === StudentApplicationStatus.REVIEW_REQUESTED ||
      data.status === StudentApplicationStatus.REJECTED;

    if (remarksRequired && !data.remarks?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Remarks are required for reject or review request.",
        path: ["remarks"],
      });
    }
  });

export type ClerkUpdateApplicationStatusInput = z.infer<
  typeof clerkUpdateApplicationStatusSchema
>;
