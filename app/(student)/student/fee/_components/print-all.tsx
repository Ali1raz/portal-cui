"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { FullFeeVoucherTemplate } from "./fee-voucher";
import { saveAsPdf } from "./save-as-pdf";
import { toast } from "sonner";
import { FullFeeVoucherData } from "@/app/data/student/st-get-fee";

interface PrintFullFeeVoucherButtonProps {
  data: FullFeeVoucherData;
  totalFeeId: string;
}

export function PrintFullFeeVoucherButton({
  data,
  totalFeeId,
}: PrintFullFeeVoucherButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handlePrintFullVoucher() {
    if (!containerRef.current) return;
    try {
      await saveAsPdf(containerRef.current, {
        filename: `full-fee-voucher-${totalFeeId.slice(0, 6)}`,
        format: "letter",
        orientation: "portrait",
        scale: 2,
        padding: 8,
      });
      toast.success("Full fee voucher downloaded successfully.");
    } catch {
      toast.error("Failed to download full fee voucher.");
    }
  }

  return (
    <>
      {/* Off-screen container with one full voucher */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          background: "white",
        }}
        aria-hidden
      >
        <div ref={containerRef}>
          <FullFeeVoucherTemplate
            id={`full-voucher-${totalFeeId}`}
            data={data}
          />
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => {
          startTransition(() => {
            void handlePrintFullVoucher();
          });
        }}
        disabled={isPending}
        className="gap-2"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Printer className="size-4" />
        )}
        {isPending ? "Generating PDF..." : "Print Full Fee Voucher"}
      </Button>
    </>
  );
}

export const PrintAllVouchersButton = PrintFullFeeVoucherButton;
