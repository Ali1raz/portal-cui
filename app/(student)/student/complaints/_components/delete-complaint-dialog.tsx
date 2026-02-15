"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteComplaint } from "../actions";
import { tryCatch } from "@/hooks/tryCatch";

/// Delete complaint confirmation dialog with warning message.
export function DeleteComplaintDialog({
  complaintId,
  children,
}: {
  complaintId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  async function handleDelete() {
    const { data: result, error } = await tryCatch(
      DeleteComplaint(complaintId)
    );

    if (error) {
      toast.error("Something bad happened. Please try again.");
      return;
    }

    if (result.status === "error") {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setOpen(false);
      router.push("/student/complaints");
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Complaint</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this complaint? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              startTransition(() => {
                void handleDelete();
              });
            }}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
