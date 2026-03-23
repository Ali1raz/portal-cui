import { formatDate } from "@/lib/utils";
import {
  IconPoint,
  IconArrowRight,
  IconCheck,
  IconX,
  IconSend,
  IconRefresh,
  IconMessage2Question,
  IconCircleCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  LRAction,
  LRActorRole,
  LeaveStatus,
} from "@/lib/generated/prisma/enums";

export interface LeaveRequestReviewTimelineItemData {
  id: string;
  actorRole: LRActorRole;
  action: LRAction;
  remarks: string | null;
  fromStatus: LeaveStatus;
  toStatus: LeaveStatus;
  createdAt: Date;
}

const ACTION_CONFIG: Partial<
  Record<
    LRAction,
    {
      label: string;
      icon: typeof IconPoint;
      color: string;
    }
  >
> = {
  [LRAction.SUBMITTED]: {
    label: "Submitted",
    icon: IconSend,
    color: "border-slate-400",
  },
  [LRAction.BA_APPROVED]: {
    label: "Batch Advisor Approved",
    icon: IconCheck,
    color: "border-green-500",
  },
  [LRAction.BA_REJECTED]: {
    label: "Batch Advisor Rejected",
    icon: IconX,
    color: "border-red-500",
  },
  [LRAction.BA_REVIEW_REQUESTED]: {
    label: "Batch Advisor Requested Review",
    icon: IconMessage2Question,
    color: "border-blue-500",
  },
  [LRAction.RESUBMITTED]: {
    label: "Resubmitted",
    icon: IconRefresh,
    color: "border-indigo-500",
  },
  [LRAction.HOD_APPROVED]: {
    label: "HOD Approved",
    icon: IconCircleCheck,
    color: "border-emerald-600",
  },
  [LRAction.HOD_REJECTED]: {
    label: "HOD Rejected",
    icon: IconX,
    color: "border-rose-600",
  },
};

const ACTOR_LABEL: Record<LRActorRole, string> = {
  [LRActorRole.STUDENT]: "Student",
  [LRActorRole.BATCH_ADVISOR]: "Batch Advisor",
  [LRActorRole.HOD]: "Head of Department",
};

export function LeaveRequestTimelineItem({
  review,
  isLast,
  actorLabelOverride,
}: {
  review: LeaveRequestReviewTimelineItemData;
  isLast: boolean;
  actorLabelOverride?: Partial<Record<LRActorRole, string>>;
}) {
  const actionCfg = ACTION_CONFIG[review.action] ?? {
    label: review.action,
    icon: IconPoint,
    color: "border-slate-200",
  };
  const ActionIcon = actionCfg.icon;

  const actorLabel =
    actorLabelOverride?.[review.actorRole] ??
    ACTOR_LABEL[review.actorRole] ??
    review.actorRole;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-background text-base",
            actionCfg.color
          )}
        >
          <ActionIcon size={16} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-semibold">{actionCfg.label}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(review.createdAt)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{actorLabel}</span>
        </div>

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-mono">
          <span>{review.fromStatus}</span>
          <IconArrowRight size={12} />
          <span className="text-foreground font-semibold">
            {review.toStatus}
          </span>
        </div>

        {review.remarks && (
          <div className="mt-3 text-sm text-foreground bg-muted/30 p-3 rounded border border-muted">
            <p className="font-medium text-xs text-muted-foreground mb-1">
              Remarks
            </p>
            <p>{review.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
