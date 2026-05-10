import { SplitRequestStatus } from "@/lib/generated/prisma/enums";

export const STUDENT_EDITABLE_SPLIT_REQUEST_STATUSES: SplitRequestStatus[] = [
  "PENDING",
  "HOD_REVIEW_REQUESTED",
  "HOD_REJECTED",
  "REJECTED",
];

export function studentCanEditSplitRequest(status: SplitRequestStatus) {
  return STUDENT_EDITABLE_SPLIT_REQUEST_STATUSES.includes(status);
}

export const SPLIT_REQUEST_DELETABLE_STATUSES: SplitRequestStatus[] = [
  "PENDING",
  "HOD_REVIEW_REQUESTED",
  "HOD_REJECTED",
  "REJECTED",
];

export function studentCanDeleteSplitRequest(status: SplitRequestStatus) {
  return SPLIT_REQUEST_DELETABLE_STATUSES.includes(status);
}

export const SPLIT_REQUEST_MARK_PAID_STATUSES: SplitRequestStatus[] = [
  "HOD_APPROVED",
  "APPROVED",
];

export function studentCanMarkPaidSplitRequest(status: SplitRequestStatus) {
  return SPLIT_REQUEST_MARK_PAID_STATUSES.includes(status);
}
