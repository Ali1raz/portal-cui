"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { FeeVoucherTemplate, VoucherData } from "./fee-voucher";
import { saveAsPdf } from "./save-as-pdf";
import { toast } from "sonner";

interface PrintVoucherButtonProps {
  data: VoucherData;
  /** "outline" for per-installment, "default" for the top-level full print */
  variant?: "outline" | "default";
  label?: string;
  filename?: string;
  size?: "sm" | "default";
}

export function PrintVoucherButton({
  data,
  variant = "outline",
  label = "Print Voucher",
  filename = "fee-voucher",
  size = "sm",
}: PrintVoucherButtonProps) {
  const voucherRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handlePrint() {
    if (!voucherRef.current) return;
    try {
      await saveAsPdf(voucherRef.current, {
        filename: `${filename}-installment-${data.installmentNo}`,
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
      {/* Off-screen hidden voucher DOM (must be in DOM for html2canvas) */}
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
            id={`voucher-hidden-${data.voucherId}-${data.installmentNo}`}
            data={data}
          />
        </div>
      </div>

      <Button
        variant={variant}
        size={size}
        onClick={() => {
          startTransition(() => {
            void handlePrint();
          });
        }}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Printer className="size-3.5" />
        )}
        {isPending ? "Generating…" : label}
      </Button>
    </>
  );
}
