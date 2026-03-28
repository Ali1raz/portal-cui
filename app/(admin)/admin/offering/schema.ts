import { z } from "zod";

/// Schema for creating a new subject offering by admins
export const createOfferingSchema = z.object({
  subjectId: z.string().min(1, { message: "Subject is required." }),
  semesterId: z.string().min(1, { message: "Semester is required." }),
  totalLectures: z
    .number()
    .int()
    .min(1, { message: "Total lectures is required." }),
});

export type CreateOfferingSchemaInputType = z.input<
  typeof createOfferingSchema
>;
