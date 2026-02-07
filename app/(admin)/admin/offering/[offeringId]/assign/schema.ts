import { z } from "zod";

/// Schema for assigning a professor to an offering.
export const assignTeacherSchema = z.object({
  professorId: z.string().min(1, { message: "Professor is required." }),
});

export type AssignTeacherSchemaType = z.infer<typeof assignTeacherSchema>;
