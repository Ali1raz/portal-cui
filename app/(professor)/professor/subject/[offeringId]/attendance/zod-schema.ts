import { z } from "zod";

export const attendanceFormSchema = z.object({
  topic: z.string().min(1, { message: "Topic is required." }),
  date: z.date({ error: "Date is required." }),
  startTime: z.string().min(1, { message: "Start time is required." }),
  endTime: z.string().min(1, { message: "End time is required." }),
});

export type AttendanceFormSchemaType = z.infer<typeof attendanceFormSchema>;
