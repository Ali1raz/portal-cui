"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { tryCatch } from "@/hooks/tryCatch";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { makeProfessorBatchAdvisor } from "../actions";

/// Dialog for appointing professor as Batch Advisor
export function MakeBatchAdvisorDialog({
  userId,
  name,
  children,
}: {
  userId: string;
  name: string | null;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAppoint() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        makeProfessorBatchAdvisor(userId)
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
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            Appoint as Batch Advisor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Appoint Batch Advisor for {name}</DialogTitle>
        </DialogHeader>
        <DialogFooter className="w-full">
          <Button
            disabled={isPending}
            onClick={handleAppoint}
            variant="destructive"
          >
            {isPending ? "Loading..." : "Confirm Appointment"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
