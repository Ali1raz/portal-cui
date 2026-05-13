"use client";

import { useTransition } from "react";

import { tryCatch } from "@/hooks/tryCatch";
import { toast } from "sonner";
import { markAttendanceAsLeave } from "../actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type MarkAsLeaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  attendanceRecordId: string;
};

export function MarkAsLeaveDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  attendanceRecordId,
}: MarkAsLeaveDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        markAttendanceAsLeave({
          studentId,
          attendanceRecordId,
        })
      );

      if (error) {
        toast.error(error.message || "Failed to mark attendance as leave");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(`Attendance marked as LEAVE for ${studentName}`);
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Attendance as Leave</AlertDialogTitle>
          <AlertDialogDescription>
            This will update the attendance status to LEAVE for{" "}
            <span className="font-semibold text-foreground">{studentName}</span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Marking..." : "Mark as Leave"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
