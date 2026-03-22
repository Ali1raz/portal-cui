import {
  ComplaintStatus,
  ActorRole,
  ReviewAction,
} from "@/lib/generated/prisma/enums";
import {
  IconArrowBackUp,
  IconArrowLeftRight,
  IconArrowRight,
  IconCircleCheck,
  IconFileDescription,
  IconMessage2Question,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export type TimelineActionIcon = ComponentType<{
  className?: string;
  size?: string | number;
}>;

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; color: string; dot: string; description: string }
> = {
  BA_PENDING: {
    label: "Under Review",
    color:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800",
    dot: "bg-amber-400 animate-pulse",
    description: "The complaint is being reviewed by the Batch Advisor.",
  },
  BA_REJECTED: {
    label: "Needs Revision",
    color:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800",
    dot: "bg-red-500",
    description: "The Batch Advisor has returned this complaint for revision.",
  },
  BA_REVIEW_REQUESTED: {
    label: "Revision Requested",
    color:
      "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-800",
    dot: "bg-orange-500",
    description: "The Batch Advisor requested more details before proceeding.",
  },
  HOD_PENDING: {
    label: "Escalated to HOD",
    color:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800",
    dot: "bg-blue-400 animate-pulse",
    description: "The complaint has been forwarded to the Head of Department.",
  },
  HOD_ACCEPTED: {
    label: "Resolved",
    color:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800",
    dot: "bg-emerald-500",
    description: "The HOD has resolved this complaint.",
  },
  HOD_REJECTED: {
    label: "Dismissed",
    color:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800",
    dot: "bg-red-500",
    description: "The HOD has dismissed this complaint.",
  },
  ASSIGNED: {
    label: "Transferred",
    color:
      "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
    dot: "bg-slate-400",
    description: "The complaint has been transferred to another department.",
  },
};

export const ACTION_CONFIG: Record<
  ReviewAction,
  { label: string; icon: TimelineActionIcon; color: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    icon: IconFileDescription,
    color: "border-slate-200 dark:border-slate-700",
  },
  BA_ACCEPTED: {
    label: "Forwarded to HOD",
    icon: IconArrowRight,
    color: "border-blue-200 dark:border-blue-800",
  },
  BA_REJECTED: {
    label: "Returned for Revision",
    icon: IconArrowBackUp,
    color: "border-red-200 dark:border-red-800",
  },
  BA_REVIEW_REQUESTED: {
    label: "Revision Requested",
    icon: IconMessage2Question,
    color: "border-orange-200 dark:border-orange-800",
  },
  RESUBMITTED: {
    label: "Resubmitted",
    icon: IconRefresh,
    color: "border-green-200 dark:border-green-800",
  },
  HOD_ACCEPTED: {
    label: "Resolved by HOD",
    icon: IconCircleCheck,
    color: "border-emerald-200 dark:border-emerald-800",
  },
  HOD_REJECTED: {
    label: "Dismissed by HOD",
    icon: IconX,
    color: "border-red-200 dark:border-red-800",
  },
  HOD_ASSIGNED: {
    label: "Assigned to HOD",
    icon: IconArrowLeftRight,
    color: "border-slate-200 dark:border-slate-700",
  },
};

export const ACTOR_LABEL: Record<ActorRole, string> = {
  STUDENT: "Student",
  BATCH_ADVISOR: "Batch Advisor",
  HOD: "Head of Department",
};
