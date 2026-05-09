"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Loader2, Printer, Pencil } from "lucide-react";
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
} from "@/components/ui/dialog";
import { deleteInstallmentSplitRequest } from "../actions";
import {
  FeeVoucherTemplate,
  type VoucherData,
} from "../../_components/fee-voucher";
import { saveAsPdf } from "../../_components/save-as-pdf";
import { useState, useRef, useTransition } from "react";

export function FeeSplitRequestActionsDropdown({
  requestId,
  canDelete,
  canEdit,
  canPrintVoucher = true,
  voucherData,
  filename,
}: {
  requestId: string;
  canDelete: boolean;
  canEdit: boolean;
  canPrintVoucher?: boolean;
  voucherData: VoucherData;
  filename?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

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

          {canPrintVoucher ? (
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
          ) : null}

          {canEdit && (
            <DropdownMenuItem
              disabled={isPending || !canEdit}
              onSelect={(event) => {
                event.preventDefault();
                router.push(`/student/fee/installments/${requestId}/edit`);
              }}
            >
              <Pencil className="size-4" />
              Edit Request
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem
              disabled={isPending || !canDelete}
              onSelect={(event) => {
                event.preventDefault();
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Cancel Request
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Installment Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this installment request? This
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
                  Canceling...
                </>
              ) : (
                "Cancel Request"
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
