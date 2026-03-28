import { StudentApplicationStatus } from "@/lib/generated/prisma/enums";

export const studentApplicationStatusColors: Record<
  StudentApplicationStatus,
  string
> = {
  PENDING: "border-amber-500",
  REVIEW_REQUESTED: "border-sky-500",
  APPROVED: "border-emerald-500",
  REJECTED: "border-rose-500",
};
