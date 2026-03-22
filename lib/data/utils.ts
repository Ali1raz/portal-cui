import { ComplaintStatus } from "../generated/prisma/enums";

export const APP = {
  page_sizes: [5, 10, 20, 50],
  default_page_size: 10,
  EFFECTIVE_THRESHOLD_PCT: 80,
};

export const ALREADY_REVIEWED_COMPLAINT_STATUS: ComplaintStatus[] = [
  ComplaintStatus.BA_REJECTED,
  ComplaintStatus.HOD_PENDING,
  ComplaintStatus.HOD_ACCEPTED,
  ComplaintStatus.HOD_REJECTED,
  ComplaintStatus.ASSIGNED,
];
