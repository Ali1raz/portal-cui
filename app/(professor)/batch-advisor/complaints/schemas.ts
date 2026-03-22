import z from "zod";

export const baUpdateComplaintStatusSchema = z.object({
  complaintId: z.string(),
  status: z.enum(["HOD_PENDING", "BA_REJECTED", "BA_REVIEW_REQUESTED"]),
  remarks: z.string().optional(),
});

export type BaUpdateComplaintStatusInput = z.infer<
  typeof baUpdateComplaintStatusSchema
>;
