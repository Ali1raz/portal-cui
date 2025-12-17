import z from "zod";

export const leaveRequestSchema = z.object({
  date: z.date({
    message: "Date is required",
  }),
  reasonTitle: z.string().min(10, "Reason must be at least 10 characters long"),
  reasonDetails: z
    .string()
    .min(20, "Details must be at least 20 characters long"),
  imageKey: z.string(),
  subjectId: z.string().nonempty("Subject is required"),
});

export type LeaveRequestFormType = z.infer<typeof leaveRequestSchema>;
