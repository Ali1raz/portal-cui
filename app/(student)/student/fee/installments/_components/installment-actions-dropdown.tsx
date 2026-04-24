"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  CircleDollarSign,
  Loader2,
  Check,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import { tryCatch } from "@/hooks/tryCatch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  deleteInstallmentSplitRequest,
  markInstallmentRequestAsPaid,
} from "../actions";
import {
  FeeVoucherTemplate,
  type VoucherData,
} from "../../_components/fee-voucher";
import { saveAsPdf } from "../../_components/save-as-pdf";

export function InstallmentActionsDropdown({
  requestId,
  canDelete,
  canMarkPaid,
  voucherData,
  filename,
}: {
  requestId: string;
  canDelete: boolean;
  canMarkPaid: boolean;
  voucherData: VoucherData;
  filename?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = React.useState(false);
  const voucherRef = React.useRef<HTMLDivElement>(null);

  async function handlePrintVoucher() {
    if (!voucherRef.current) {
      toast.error("Could not prepare voucher for printing.");
      return;
    }

    const safeFilename = filename ?? "fee-voucher";

    try {
      await saveAsPdf(voucherRef.current, {
        filename: `${safeFilename}-installment-${voucherData.installmentNo}`,
        format: "a4",
        orientation: "portrait",
        scale: 2,
        padding: 8,
      });
      toast.success("Voucher downloaded successfully.");
    } catch {
      toast.error("Failed to download voucher.");
    }
  }

  async function handleMarkPaid() {
    const { data: result, error } = await tryCatch(
      markInstallmentRequestAsPaid(requestId)
    );

    if (error) {
      toast.error("Something bad happened. Please try again.");
      return;
    }

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIsMarkPaidOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    const { data: result, error } = await tryCatch(
      deleteInstallmentSplitRequest(requestId)
    );

    if (error) {
      toast.error("Something bad happened. Please try again.");
      return;
    }

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIsDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isPending}
            onSelect={(event) => {
              event.preventDefault();
              startTransition(() => {
                void handlePrintVoucher();
              });
            }}
          >
            <Printer className="size-4" />
            Print Voucher
          </DropdownMenuItem>

          {canMarkPaid ? (
            <DropdownMenuItem
              disabled={isPending}
              onSelect={(event) => {
                event.preventDefault();
                setIsMarkPaidOpen(true);
              }}
            >
              <CircleDollarSign className="size-4" />
              Mark as Paid
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Check className="size-4" />
              Mark as Paid
            </DropdownMenuItem>
          )}

          {canDelete ? (
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DialogTrigger>
          ) : (
            <DropdownMenuItem disabled>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Installment as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this installment request as paid?
              This will update your installment status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMarkPaidOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void handleMarkPaid();
                });
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin size-4" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Installment Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this installment request? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void handleDelete();
                });
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin size-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
        aria-hidden
      >
        <div ref={voucherRef}>
          <FeeVoucherTemplate
            id={`voucher-hidden-${voucherData.voucherId}-${voucherData.installmentNo}`}
            data={voucherData}
          />
        </div>
      </div>
    </>
  );
}
