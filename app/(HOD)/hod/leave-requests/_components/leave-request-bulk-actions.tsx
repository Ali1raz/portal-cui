"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tryCatch } from "@/hooks/tryCatch";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { bulkUpdateLeaveRequestStatus } from "../actions";
import type { GetLeaveRequestsType } from "@/app/data/hod/get-leave-requests";
import { LeaveStatus } from "@/lib/generated/prisma/enums";

/// Bulk actions component for selected leave request rows to update status.
export function LeaveRequestBulkActions({
  selectedIds,
  requests,
  onSuccess,
}: {
  selectedIds: string[];
  requests: GetLeaveRequestsType[];
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Check if all selected requests have the same status
  const statuses = new Set(requests.map((r) => r.status));
  const hasUniformStatus = statuses.size === 1;
  const currentStatus = hasUniformStatus ? Array.from(statuses)[0] : undefined;

  function handleStatusUpdate(newStatus: LeaveStatus) {
    if (!currentStatus || newStatus === currentStatus) return;

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        bulkUpdateLeaveRequestStatus(selectedIds, newStatus)
      );

      if (error) {
        toast.error("Something bad happened.");
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
    <div className="flex items-center gap-3 flex-wrap">
      <p className="text-sm text-muted-foreground">
        {selectedIds.length} {selectedIds.length === 1 ? "request" : "requests"}{" "}
        selected
      </p>

      {hasUniformStatus && currentStatus ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Update status:</span>
          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusUpdate(value as LeaveStatus)}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LeaveStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select requests with the same status to bulk update
        </p>
      )}
    </div>
  );
}
