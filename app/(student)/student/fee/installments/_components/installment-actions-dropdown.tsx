"use client";

import { MoreHorizontal, Printer } from "lucide-react";
import { toast } from "sonner";
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
  FeeVoucherTemplate,
  type VoucherData,
} from "../../_components/fee-voucher";
import { saveAsPdf } from "../../_components/save-as-pdf";
import { useRef, useTransition } from "react";

export function InstallmentActionsDropdown({
  canPrintVoucher = true,
  voucherData,
  filename,
}: {
  canPrintVoucher?: boolean;
  voucherData: VoucherData;
  filename?: string;
}) {
  const [isPending, startTransition] = useTransition();
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
        </DropdownMenuContent>
      </DropdownMenu>

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
