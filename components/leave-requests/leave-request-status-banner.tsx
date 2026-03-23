import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { cn, formatEnumLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { leaveRequestStatusColors } from "./leave-request-status-colors";

const LEAVE_STATUS_DESCRIPTION: Record<LeaveStatus, string> = {
  PENDING: "Waiting for Batch Advisor review.",
  REVIEW_REQUESTED: "More details requested by Batch Advisor.",
  HOD_PENDING: "Forwarded to Head of Department for final decision.",
  APPROVED: "Leave request is approved.",
  REJECTED: "Leave request was rejected.",
};

const LEAVE_STATUS_DOT_COLORS: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-500",
  REVIEW_REQUESTED: "bg-sky-500",
  HOD_PENDING: "bg-violet-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};

export function LeaveRequestStatusBanner({
  status,
  descriptionOverride,
}: {
  status: LeaveStatus;
  descriptionOverride?: string;
}) {
  return (
    <Card className={cn("border", leaveRequestStatusColors[status])}>
      <CardContent className="flex items-start gap-3">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full animate-pulse mt-1",
            LEAVE_STATUS_DOT_COLORS[status]
          )}
        />
        <div>
          <p className="font-semibold text-sm">{formatEnumLabel(status)}</p>
          <p className="text-xs mt-0.5 opacity-80">
            {descriptionOverride ?? LEAVE_STATUS_DESCRIPTION[status]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
