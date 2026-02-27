import z from "zod";
import {
  AnnouncementStatus,
  AnnouncementType,
  Department,
  Program,
  Batch,
} from "@/lib/generated/prisma/enums";

export const accountantAnnouncementSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters." }),
  type: z.enum(AnnouncementType),
  status: z.enum(AnnouncementStatus),
  scheduledFor: z.date().nullable().optional(),
  isPinned: z.boolean(),
  imageKey: z.string().optional(),
  targetDepartment: z.enum(Department).nullable().optional(),
  targetProgram: z.enum(Program).nullable().optional(),
  targetBatch: z.enum(Batch).nullable().optional(),
  targetYear: z.number().int().min(2000).max(2100).nullable().optional(),
});

export type AccountantAnnouncementSchemaType = z.infer<
  typeof accountantAnnouncementSchema
>;
