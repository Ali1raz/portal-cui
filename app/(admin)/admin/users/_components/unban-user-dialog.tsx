"use client";

import { useTransition } from "react";
import { Loader2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { tryCatch } from "@/hooks/tryCatch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UnbanUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
}: {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUnban() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        authClient.admin.unbanUser({ userId })
      );

      if (error) {
        toast.error("Something went wrong.");
        return;
      }

      if (result?.error) {
        toast.error(result.error.message ?? "Failed to unban user");
        return;
      }

      toast.success(`${userName} has been unbanned.`);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserCheck className="size-5" />
            Unban {userName}
          </DialogTitle>
          <DialogDescription>
            This will restore the user&apos;s access to the application.
          </DialogDescription>
        </DialogHeader>

        <p className="text-muted-foreground text-sm">
          Are you sure you want to unban <strong>{userName}</strong>? They will
          be able to sign in again immediately.
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" disabled={isPending} onClick={handleUnban}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Unbanning...
              </>
            ) : (
              "Unban User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
