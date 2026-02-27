"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  hodBulkDeleteAnnouncements,
  hodBulkUpdateAnnouncementStatus,
} from "../actions";
import type { HodAnnouncementRow } from "@/app/data/hod/get-announcements";
import { AnnouncementStatus } from "@/lib/generated/prisma/enums";
import { formatEnumLabel } from "@/lib/utils";

/// Bulk actions component for selected announcement rows including delete and status update.
export function HodAnnouncementsBulkActions({
  selectedIds,
  announcements,
  onSuccess,
}: {
  selectedIds: string[];
  announcements: HodAnnouncementRow[];
  onSuccess: () => void;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Check if all selected announcements have the same status
  const statuses = new Set(announcements.map((a) => a.status));
  const hasUniformStatus = statuses.size === 1;
  const currentStatus = hasUniformStatus ? Array.from(statuses)[0] : undefined;

  function handleBulkDelete() {
    startTransition(async () => {
      await toast.promise(
        (async () => {
          const result = await hodBulkDeleteAnnouncements(selectedIds);
          if (result.status === "error") {
            throw new Error(result.message);
          }
          return result;
        })(),
        {
          loading: "Deleting announcements...",
          success: (data) => {
            toast.success(data.message);
            router.refresh();
            setDeleteDialogOpen(false);
            onSuccess();
            return data.message;
          },
          error: (err) => err?.message || "Something went wrong",
        }
      );
    });
  }

  function handleStatusUpdate(newStatus: AnnouncementStatus) {
    if (!currentStatus || newStatus === currentStatus) return;

    startTransition(async () => {
      await toast.promise(
        (async () => {
          const result = await hodBulkUpdateAnnouncementStatus(
            selectedIds,
            newStatus
          );
          if (result.status === "error") {
            throw new Error(result.message);
          }
          return result;
        })(),
        {
          loading: "Updating status...",
          success: (data) => {
            router.refresh();
            onSuccess();
            return data.message;
          },
          error: (err) => err?.message || "Something went wrong",
        }
      );
    });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <p className="text-sm text-muted-foreground">
        {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"}{" "}
        selected
      </p>

      {hasUniformStatus && currentStatus && (
        <Select
          value={currentStatus}
          onValueChange={(value) =>
            handleStatusUpdate(value as AnnouncementStatus)
          }
          disabled={isPending}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Update status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AnnouncementStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {formatEnumLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            <Trash2 className="size-4" />
            Delete Selected
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete announcements</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "announcement" : "announcements"}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleBulkDelete}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
