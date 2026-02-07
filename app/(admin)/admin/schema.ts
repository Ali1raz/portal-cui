import z from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  creditHours: z.number().min(1).max(4),
});

export type SubjectSchemaType = z.infer<typeof subjectSchema>;
