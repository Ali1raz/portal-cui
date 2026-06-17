"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/tryCatch";
import { bulkMarkAttendanceAsLeave } from "../actions";
import type { GetApprovedLeaveRequestsType } from "@/app/data/admin/get-approved-leave-requests";
import { Button } from "@/components/ui/button";

/// Bulk actions component for selected approved leave request rows to mark attendance as leave.
export function ApprovedLeaveRequestsBulkActions({
  selectedIds,
  requests,
  onSuccess,
}: {
  selectedIds: string[];
  requests: GetApprovedLeaveRequestsType[];
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter requests that can be marked as leave (ABSENT status with attendance record)
  const markableRequests = requests.filter(
    (r) => r.attendanceStatus === "ABSENT" && r.attendanceRecordId
  );

  const canBulkMark =
    markableRequests.length > 0 && markableRequests.length === requests.length;

  function handleBulkMarkAsLeave() {
    if (markableRequests.length === 0) {
      toast.error("No requests can be marked as leave");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        bulkMarkAttendanceAsLeave(
          markableRequests.map((r) => ({
            studentId: r.studentId,
            attendanceRecordId: r.attendanceRecordId!,
          }))
        )
      );

      if (error) {
        toast.error("Something went wrong.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
        onSuccess();
      }
    });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap my-4 p-3 rounded-md border bg-muted/30">
      <p className="text-sm text-muted-foreground">
        {selectedIds.length} {selectedIds.length === 1 ? "request" : "requests"}{" "}
        selected
      </p>

      {canBulkMark ? (
        <div className="flex items-center gap-2 ml-auto">
          <p className="text-sm text-muted-foreground">
            {markableRequests.length} can be marked as leave
          </p>
          <Button
            asChild
            size="sm"
            onClick={handleBulkMarkAsLeave}
            disabled={isPending}
            variant="default"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Mark as Leave
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {markableRequests.length === 0
            ? "Selected requests cannot be marked as leave"
            : "All selected requests must be markable to perform bulk action"}
        </p>
      )}
    </div>
  );
}
