import z from "zod";
import { applyFormSchema } from "@/app/(public)/schema";

export const updateMyApplicationSchema = applyFormSchema.omit({
  semesterId: true,
});

export const updateMyApplicationPayloadSchema = z.object({
  applicationId: z.string().min(1, "Application id is required."),
  values: updateMyApplicationSchema,
});

export type UpdateMyApplicationInput = z.infer<
  typeof updateMyApplicationSchema
>;
