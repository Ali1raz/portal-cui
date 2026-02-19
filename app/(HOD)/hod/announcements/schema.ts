import z from "zod";
import { AnnouncementType } from "@/lib/generated/prisma/enums";

export const announcementSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters." }),
  type: z.enum(AnnouncementType),
  scheduledFor: z.date().nullable().optional(),
  isPinned: z.boolean(),
  imageKey: z.string().optional(),
});

export type AnnouncementSchemaType = z.infer<typeof announcementSchema>;
