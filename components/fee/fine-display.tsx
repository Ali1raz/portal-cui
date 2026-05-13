import { AlertTriangle, Clock } from "lucide-react";
import {
  calculateFine,
  extractFinePolicy,
  getFineDescription,
  formatFineAmount,
  FinePolicyType,
} from "@/lib/utils/fine-calculation";

interface FineDisplayProps {
  dueDate: Date | string;
  status?: string;
  fineType?: string | null;
  fineAmount?: number | null;
  fineMaxDays?: number | null;
  fineCapAmount?: number | null;
  className?: string;
}

export function FineDisplay({
  dueDate,
  status,
  fineType,
  fineAmount,
  fineMaxDays,
  fineCapAmount,
  className = "",
}: FineDisplayProps) {
  // Don't show fine for paid installments
  if (status === "PAID") {
    return "-";
  }

  const policy = extractFinePolicy({
    fineType: fineType as FinePolicyType | null,
    fineAmount: fineAmount ?? null,
    fineMaxDays: fineMaxDays ?? null,
    fineCapAmount: fineCapAmount ?? null,
  });

  const calculation = calculateFine(dueDate, new Date(), policy);

  if (!calculation.policyApplied) {
    return (
      <div
        className={`flex items-center gap-1.5 text-muted-foreground ${className}`}
      >
        <Clock className="size-3.5" />
        <span className="text-sm">No late fee</span>
      </div>
    );
  }

  if (!calculation.isOverdue) {
    return "-";
  }

  if (calculation.fineAmount === 0) {
    return (
      <div className={`flex items-center gap-1.5 text-orange-600 ${className}`}>
        <AlertTriangle className="size-3.5" />
        <span className="text-sm">Overdue</span>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-xs text-muted-foreground">
        {getFineDescription(calculation, policy)}
      </div>
      {calculation.fineAmount > 0 && (
        <div className="text-sm font-semibold text-red-600">
          {formatFineAmount(calculation.fineAmount)} fine
        </div>
      )}
    </div>
  );
}
