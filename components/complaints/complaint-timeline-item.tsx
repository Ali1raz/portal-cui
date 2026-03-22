import { formatDate } from "@/lib/utils";
import {
  IconUser,
  IconBuilding,
  IconPoint,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ACTION_CONFIG, ACTOR_LABEL } from "./complaint-constants";
import {
  ActorRole,
  ReviewAction,
  ComplaintStatus,
  Department,
} from "@/lib/generated/prisma/enums";

export interface ComplaintReviewTimelineItemData {
  id: string;
  actorRole: ActorRole;
  action: ReviewAction;
  remarks: string | null;
  fromStatus: ComplaintStatus;
  toStatus: ComplaintStatus;
  department: Department;
  createdAt: Date;
  batchAdvisor?: {
    user: {
      name: string;
    };
  } | null;
}

export function ComplaintTimelineItem({
  review,
  isLast,
  actorLabelOverride,
}: {
  review: ComplaintReviewTimelineItemData;
  isLast: boolean;
  actorLabelOverride?: Partial<Record<ActorRole, string>>;
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
      {/* Spine */}
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

      {/* Content */}
      <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-semibold">{actionCfg.label}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(review.createdAt)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconUser size={11} />
            {actorLabel}
            {review.batchAdvisor?.user?.name && (
              <span className="text-foreground font-medium">
                — {review.batchAdvisor.user.name}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <IconBuilding size={11} />
            {review.department}
          </span>
        </div>

        {/* Status transition pill */}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-mono">
          <span>{review.fromStatus}</span>
          <IconArrowRight size={12} />
          <span className="text-foreground font-semibold">
            {review.toStatus}
          </span>
        </div>

        {review.remarks && (
          <blockquote className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground italic leading-relaxed">
            {`"${review.remarks}"`}
          </blockquote>
        )}
      </div>
    </div>
  );
}
