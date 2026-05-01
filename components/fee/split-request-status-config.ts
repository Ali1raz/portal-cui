import { SplitRequestStatus } from "@/lib/generated/prisma/enums";

export const SPLIT_REQUEST_STATUS_BADGE_CONFIG: Record<
  SplitRequestStatus,
  "secondary" | "destructive" | "warning" | "outline"
> = {
  PENDING: "warning",
  HOD_REVIEW_REQUESTED: "outline",
  HOD_APPROVED: "secondary",
  APPROVED: "secondary",
  HOD_REJECTED: "destructive",
  REJECTED: "destructive",
  CANCELLED: "outline",
};
