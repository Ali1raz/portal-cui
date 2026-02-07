import { z } from "zod";
import { Department } from "@/lib/generated/prisma/enums";

/// Schema for creating a new subject offering by admins
export const createOfferingSchema = z.object({
  subjectId: z.string().min(1, { message: "Subject is required." }),
  department: z.nativeEnum(Department, {
    message: "Department is required.",
  }),
  semester: z.coerce
    .number()
    .int()
    .min(1, { message: "Semester is required." }),
  year: z.coerce.number().int().min(2000, { message: "Year is required." }),
  section: z.string().min(1, { message: "Section is required." }),
  totalLectures: z.coerce
    .number()
    .int()
    .min(1, { message: "Total lectures is required." }),
});

export type CreateOfferingSchemaType = z.infer<typeof createOfferingSchema>;
export type CreateOfferingSchemaInputType = z.input<
  typeof createOfferingSchema
>;
