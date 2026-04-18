"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { FullFeeVoucherData, FullFeeVoucherTemplate } from "./fee-voucher";
import { saveAsPdf } from "./save-as-pdf";
import { toast } from "sonner";

interface PrintFullFeeVoucherButtonProps {
  data: FullFeeVoucherData;
  totalFeeId: string;
}

export function PrintFullFeeVoucherButton({
  data,
  totalFeeId,
}: PrintFullFeeVoucherButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function handlePrintFullVoucher() {
    if (!containerRef.current) return;
    setLoading(true);
    try {
      await saveAsPdf(containerRef.current, {
        filename: `full-fee-voucher-${totalFeeId.slice(0, 6)}`,
        format: "a4",
        orientation: "portrait",
        scale: 2,
        padding: 8,
      });
    } catch (err) {
      toast.error(`PDF generation failed:, ${err}`);
    } finally {
      setLoading(false);
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
        onClick={handlePrintFullVoucher}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Printer className="size-4" />
        )}
        {loading ? "Generating PDF..." : "Print Full Fee Voucher"}
      </Button>
    </>
  );
}

export const PrintAllVouchersButton = PrintFullFeeVoucherButton;
