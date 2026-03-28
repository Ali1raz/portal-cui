"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StudentApplicationStatus } from "@/lib/generated/prisma/enums";
import { formatEnumLabel } from "@/lib/utils";
import { tryCatch } from "@/hooks/tryCatch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { clerkBulkUpdateApplicationStatus } from "../actions";

const clerkBulkAllowedStatuses: StudentApplicationStatus[] = [
  "APPROVED",
  "REVIEW_REQUESTED",
  "REJECTED",
];

/// Bulk status update action bar for selected clerk applications.
export function ClerkApplicationsBulkActions({
  selectedIds,
  currentStatus,
  onSuccess,
}: {
  selectedIds: string[];
  currentStatus: StudentApplicationStatus;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState<StudentApplicationStatus>(currentStatus);
  const [remarks, setRemarks] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const remarksRequired =
    status === "REVIEW_REQUESTED" || status === "REJECTED";

  function handleBulkUpdate() {
    if (selectedIds.length === 0) return;

    if (remarksRequired && !remarks.trim()) {
      toast.error("Remarks are required for reject or review request.");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        clerkBulkUpdateApplicationStatus({
          applicationIds: selectedIds,
          status,
          remarks: remarks.trim() || undefined,
        })
      );

      if (error) {
        toast.error("Something went wrong.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      setRemarks("");
      setStatus(currentStatus);
      setIsDialogOpen(false);
      onSuccess();
    });
  }

  return (
    <div className="my-2 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {selectedIds.length}{" "}
          {selectedIds.length === 1 ? "application" : "applications"} selected
        </p>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              disabled={isPending || selectedIds.length === 0}
            >
              Update Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk update application status</DialogTitle>
              <DialogDescription>
                Update status for {selectedIds.length} selected{" "}
                {selectedIds.length === 1 ? "application" : "applications"}.
                Current status: {formatEnumLabel(currentStatus)}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clerk-bulk-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as StudentApplicationStatus)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="clerk-bulk-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {clerkBulkAllowedStatuses.map((statusValue) => (
                      <SelectItem key={statusValue} value={statusValue}>
                        {formatEnumLabel(statusValue)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clerk-bulk-remarks">
                  Remarks
                  {remarksRequired ? (
                    <span className="text-destructive ml-1">*</span>
                  ) : null}
                </Label>
                <Textarea
                  id="clerk-bulk-remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder={
                    remarksRequired
                      ? "Add reason/required changes for selected applications..."
                      : "Add optional notes..."
                  }
                  rows={4}
                  disabled={isPending}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleBulkUpdate}
                disabled={isPending || selectedIds.length === 0}
                variant={status === "REJECTED" ? "destructive" : "default"}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Selected"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
