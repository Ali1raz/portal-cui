"use client";

import { Button } from "@/components/ui/button";
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
import { tryCatch } from "@/hooks/tryCatch";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adminBulkDeleteAnnouncements } from "../actions";

/// Bulk actions component for selected announcement rows including delete.
export function AdminAnnouncementsBulkActions({
  selectedIds,
  onSuccess,
}: {
  selectedIds: string[];
  onSuccess: () => void;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleBulkDelete() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        adminBulkDeleteAnnouncements(selectedIds)
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
        setDeleteDialogOpen(false);
        onSuccess();
      }
    });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <p className="text-sm text-muted-foreground">
        {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"}{" "}
        selected
      </p>

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
