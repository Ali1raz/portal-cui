"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { tryCatch } from "@/hooks/tryCatch";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateStatus } from "../../actions";

// HOD can only approve or reject HOD_PENDING requests
export const HOD_ALLOWED_LEAVE_STATUSES: LeaveStatus[] = [
  LeaveStatus.APPROVED,
  LeaveStatus.REJECTED,
];

export function UpdateStatusDialog({
  children,
  requestId,
  prevStatus,
}: {
  children?: React.ReactNode;
  requestId: string;
  prevStatus: LeaveStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeaveStatus>(
    HOD_ALLOWED_LEAVE_STATUSES[0] ?? prevStatus
  );
  const router = useRouter();

  const onClick = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateStatus(requestId, status)
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.push("/hod/leave-requests");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          {children || <Button>Update Status</Button>}
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Approve or Reject Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as LeaveStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Update status</SelectLabel>
                  {HOD_ALLOWED_LEAVE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === LeaveStatus.APPROVED ? "Approve" : "Reject"}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="w-full">
            <Button
              onClick={onClick}
              disabled={isPending}
              variant={
                status === LeaveStatus.APPROVED ? "default" : "destructive"
              }
            >
              {isPending ? "Updating..." : "Confirm"}
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
