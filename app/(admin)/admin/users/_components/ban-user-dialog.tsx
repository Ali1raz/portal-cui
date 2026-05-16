"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DURATION_OPTIONS = [
  { label: "24 hours", value: 60 * 60 * 24 },
  { label: "7 days", value: 60 * 60 * 24 * 7 },
  { label: "30 days", value: 60 * 60 * 24 * 30 },
  { label: "Permanent (never expires)", value: undefined },
] as const;

export function BanUserDialog({
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
  const [banReason, setBanReason] = useState("");
  const [banExpiresIn, setBanExpiresIn] = useState<number | undefined>(
    DURATION_OPTIONS[1].value
  );
  const router = useRouter();

  function handleClose(open: boolean) {
    if (!open) {
      setBanReason("");
      setBanExpiresIn(DURATION_OPTIONS[1].value);
    }
    onOpenChange(open);
  }

  function handleBan() {
    if (!banReason.trim()) {
      toast.error("Please provide a reason for the ban.");
      return;
    }

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        authClient.admin.banUser({
          userId,
          banReason: banReason.trim(),
          banExpiresIn,
        })
      );

      if (error) {
        toast.error("Something went wrong.");
        return;
      }

      if (result?.error) {
        toast.error(result.error.message ?? "Failed to ban user");
        return;
      }

      toast.success(`${userName} has been banned.`);
      setBanReason("");
      setBanExpiresIn(DURATION_OPTIONS[1].value);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Ban {userName}
          </DialogTitle>
          <DialogDescription>
            This will prevent the user from signing in and revoke all their
            sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">
              Ban reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ban-reason"
              placeholder="Enter reason for ban"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ban-duration">Ban duration</Label>
            <Select
              value={banExpiresIn?.toString() ?? "permanent"}
              onValueChange={(value) =>
                setBanExpiresIn(
                  value === "permanent" ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger id="ban-duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.label}
                    value={option.value?.toString() ?? "permanent"}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !banReason.trim()}
            onClick={handleBan}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Banning...
              </>
            ) : (
              "Ban User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
