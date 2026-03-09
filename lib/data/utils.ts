import { ComplaintStatus } from "../generated/prisma/enums";

export const APP = {
  page_sizes: [5, 10, 20, 50],
  default_page_size: 10,
  EFFECTIVE_THRESHOLD_PCT: 80,
};

export const LeaveRequestStatusVariantMap: Record<
  ComplaintStatus,
  "warning" | "info" | "success" | "destructive"
> = {
  BA_PENDING: "warning",
  HOD_PENDING: "warning",
  REASSIGNED: "info",
  HOD_ACCEPTED: "success",
  BA_REJECTED: "destructive",
  HOD_REJECTED: "destructive",
};
