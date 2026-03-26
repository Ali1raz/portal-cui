import { StudentApplicationStatus } from "@/lib/generated/prisma/enums";
import { cn, formatEnumLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { studentApplicationStatusColors } from "./student-application-status-colors";

const STUDENT_APPLICATION_STATUS_DESCRIPTION: Record<
  StudentApplicationStatus,
  string
> = {
  PENDING: "Your application is waiting for review.",
  REVIEW_REQUESTED: "Update requested to your application.",
  APPROVED: "Your application has been approved.",
  REJECTED: "Your application was rejected.",
};

const STUDENT_APPLICATION_STATUS_DOT_COLORS: Record<
  StudentApplicationStatus,
  string
> = {
  PENDING: "bg-amber-500",
  REVIEW_REQUESTED: "bg-sky-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};

export function StudentApplicationStatusBanner({
  status,
  descriptionOverride,
}: {
  status: StudentApplicationStatus;
  descriptionOverride?: string;
}) {
  return (
    <Card className={cn("border", studentApplicationStatusColors[status])}>
      <CardContent className="flex items-start gap-3">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full animate-pulse mt-1",
            STUDENT_APPLICATION_STATUS_DOT_COLORS[status]
          )}
        />
        <div>
          <p className="font-semibold text-sm">{formatEnumLabel(status)}</p>
          <p className="text-xs mt-0.5 opacity-80">
            {descriptionOverride ??
              STUDENT_APPLICATION_STATUS_DESCRIPTION[status]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
