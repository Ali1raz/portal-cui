import {
  ComplaintStatus,
  ActorRole,
  ReviewAction,
} from "@/lib/generated/prisma/enums";

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
  REASSIGNED: {
    label: "Transferred",
    color:
      "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
    dot: "bg-slate-400",
    description: "The complaint has been transferred to another department.",
  },
};

export const ACTION_CONFIG: Record<
  ReviewAction,
  { label: string; icon: string; color: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    icon: "📝",
    color: "border-slate-200 dark:border-slate-700",
  },
  BA_ACCEPTED: {
    label: "Forwarded to HOD",
    icon: "✅",
    color: "border-blue-200 dark:border-blue-800",
  },
  BA_REJECTED: {
    label: "Returned for Revision",
    icon: "↩️",
    color: "border-red-200 dark:border-red-800",
  },
  HOD_ACCEPTED: {
    label: "Resolved by HOD",
    icon: "🎉",
    color: "border-emerald-200 dark:border-emerald-800",
  },
  HOD_REJECTED: {
    label: "Dismissed by HOD",
    icon: "🚫",
    color: "border-red-200 dark:border-red-800",
  },
  HOD_REASSIGNED: {
    label: "Transferred",
    icon: "🔀",
    color: "border-slate-200 dark:border-slate-700",
  },
  HOD_ASSIGNED: {
    label: "Assigned to HOD",
    icon: "🔀",
    color: "border-slate-200 dark:border-slate-700",
  },
};

export const ACTOR_LABEL: Record<ActorRole, string> = {
  STUDENT: "Student",
  BATCH_ADVISOR: "Batch Advisor",
  HOD: "Head of Department",
};
