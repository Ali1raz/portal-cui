import { LeaveStatus } from "@/lib/generated/prisma/enums";

export const leaveRequestStatusColors: Record<LeaveStatus, string> = {
  PENDING: "border-amber-500",
  REVIEW_REQUESTED: "border-sky-500",
  HOD_PENDING: "border-violet-500",
  APPROVED: "border-emerald-500",
  REJECTED: "border-rose-500",
};
