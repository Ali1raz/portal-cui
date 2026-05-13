"use client";

import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/lib/generated/prisma/enums";

type AttendanceStatusBadgeProps = {
  status: AttendanceStatus | null;
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  // Not marked yet
  if (status === null) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Not marked yet</Badge>
      </div>
    );
  }

  // Already marked as LEAVE - done
  if (status === "LEAVE") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="success">Done</Badge>
      </div>
    );
  }

  // Marked as ABSENT - needs override
  if (status === "ABSENT") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Needs override</Badge>
      </div>
    );
  }

  // PRESENT status - shouldn't happen but handle it
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline">{status}</Badge>
    </div>
  );
}
