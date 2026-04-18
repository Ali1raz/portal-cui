"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/tryCatch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { formatEnumLabel } from "@/lib/utils";
import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import { accountantUpdateFeeStatus } from "../../actions";

export function AccFeeUpdateStatusDrawer({
  feeId,
  currentStatus,
  children,
}: {
  feeId: string;
  currentStatus: SemesterFeeStatus;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<SemesterFeeStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        accountantUpdateFeeStatus(feeId, selectedStatus)
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
      setOpen(false);
    });
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Update Fee Status</DrawerTitle>
          <DrawerDescription>
            Choose a new publishing status for this semester fee.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="fee-status-select">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as SemesterFeeStatus)
              }
            >
              <SelectTrigger id="fee-status-select" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SemesterFeeStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatEnumLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DrawerFooter className="px-0 pb-0">
            <Button
              onClick={handleSave}
              disabled={isPending || selectedStatus === currentStatus}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
