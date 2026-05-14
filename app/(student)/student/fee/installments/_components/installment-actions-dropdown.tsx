"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, MoreHorizontal, Printer } from "lucide-react";
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

import {
  FeeVoucherTemplate,
  type VoucherData,
} from "../../_components/fee-voucher";
import { saveAsPdf } from "../../_components/save-as-pdf";
import { markStudentInstallmentAsPaid } from "../actions";
import { useRef, useState, useTransition } from "react";

export function InstallmentActionsDropdown({
  canPrintVoucher = true,
  canMarkPaid = false,
  installmentId,
  voucherData,
  filename,
}: {
  canPrintVoucher?: boolean;
  canMarkPaid?: boolean;
  installmentId?: string;
  voucherData: VoucherData;
  filename?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
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

  async function handleMarkAsPaid() {
    if (!installmentId) {
      toast.error("Missing installment details.");
      return;
    }

    const { data: result, error } = await tryCatch(
      markStudentInstallmentAsPaid(installmentId)
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

          {canPrintVoucher && (
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
          )}

          <DropdownMenuItem
            disabled={isPending || !canMarkPaid || !installmentId}
            onSelect={(event) => {
              event.preventDefault();
              setIsMarkPaidOpen(true);
            }}
          >
            <Check className="size-4" />
            Mark as Paid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Installment as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this installment as paid?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsMarkPaidOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void handleMarkAsPaid();
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
