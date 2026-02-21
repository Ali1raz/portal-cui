import z from "zod";
import {
  AnnouncementStatus,
  AnnouncementType,
  Department,
} from "@/lib/generated/prisma/enums";

export const adminAnnouncementSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters." }),
  type: z.enum(AnnouncementType),
  status: z.enum(AnnouncementStatus),
  scheduledFor: z.date().nullable().optional(),
  isPinned: z.boolean(),
  imageKey: z.string().optional(),
  targetDepartment: z.enum(Department).nullable().optional(),
});

export type AdminAnnouncementSchemaType = z.infer<
  typeof adminAnnouncementSchema
>;
