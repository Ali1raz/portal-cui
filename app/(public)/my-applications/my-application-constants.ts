import { StudentApplicationStatus } from "@/lib/generated/prisma/enums";

export const MY_APPLICATION_EDITABLE_STATUSES: StudentApplicationStatus[] = [
  StudentApplicationStatus.PENDING,
  StudentApplicationStatus.REVIEW_REQUESTED,
  StudentApplicationStatus.REJECTED,
];
