import { ComplaintCategory } from "@/lib/generated/prisma/enums";
import z from "zod";

export const complaintSchema = z.object({
  category: z.enum(ComplaintCategory),
  title: z.string().min(8, { message: "Title must be at least 8 characters" }),
  details: z
    .string()
    .min(15, { message: "Details must be at least 15 characters" }),
  imageKey: z.string().optional(),
});

export type ComplaintSchemaType = z.infer<typeof complaintSchema>;
