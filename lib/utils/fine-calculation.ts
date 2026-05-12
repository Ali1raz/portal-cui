// Define FinePolicyType locally to avoid Prisma dependency issues
export enum FinePolicyType {
  FIXED = "FIXED",
  PER_DAY = "PER_DAY",
}

export interface FinePolicy {
  fineType: FinePolicyType | null;
  fineAmount: number | null;
  fineMaxDays: number | null;
  fineCapAmount: number | null;
}

export interface FineCalculationResult {
  fineAmount: number;
  daysOverdue: number;
  isOverdue: boolean;
  policyApplied: boolean;
}

export function calculateFine(
  dueDate: Date | string,
  currentDate: Date = new Date(),
  policy: FinePolicy
): FineCalculationResult {
  // If no fine policy is set, return zero fine
  if (!policy.fineType || !policy.fineAmount) {
    return {
      fineAmount: 0,
      daysOverdue: 0,
      isOverdue: false,
      policyApplied: false,
    };
  }

  const due = new Date(dueDate);
  const now = new Date(currentDate);

  // Calculate overdue days. If the due date has passed, count the first overdue day
  // as soon as the current time is after the due datetime.
  const timeDiff = now.getTime() - due.getTime();
  const daysOverdue =
    timeDiff > 0 ? Math.floor(timeDiff / (1000 * 60 * 60 * 24)) : 0;
  // Not overdue yet
  if (daysOverdue === 0) {
    return {
      fineAmount: 0,
      daysOverdue: 0,
      isOverdue: false,
      policyApplied: true,
    };
  }

  let fineAmount = 0;

  switch (policy.fineType) {
    case FinePolicyType.FIXED:
      // Fixed flat charge applied once past due date
      fineAmount = policy.fineAmount;
      break;

    case FinePolicyType.PER_DAY:
      // Daily rate multiplied by days overdue
      const applicableDays = policy.fineMaxDays
        ? Math.min(daysOverdue, policy.fineMaxDays)
        : daysOverdue;

      fineAmount = policy.fineAmount * applicableDays;

      // Apply cap if specified
      if (policy.fineCapAmount && fineAmount > policy.fineCapAmount) {
        fineAmount = policy.fineCapAmount;
      }
      break;

    default:
      // Unknown fine type, treat as no fine
      return {
        fineAmount: 0,
        daysOverdue,
        isOverdue: daysOverdue > 0,
        policyApplied: false,
      };
  }

  return {
    fineAmount,
    daysOverdue,
    isOverdue: daysOverdue > 0,
    policyApplied: true,
  };
}

export function formatFineAmount(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getFineDescription(
  calculation: FineCalculationResult,
  policy: FinePolicy
): string {
  if (!calculation.policyApplied) {
    return "No late fee policy";
  }

  if (!calculation.isOverdue) {
    return "-";
  }

  if (calculation.fineAmount === 0) {
    return "No fine due";
  }

  switch (policy.fineType) {
    case FinePolicyType.FIXED:
      return `Late fee: ${formatFineAmount(calculation.fineAmount)}`;

    case FinePolicyType.PER_DAY:
      const description = `Late fee: ${formatFineAmount(calculation.fineAmount)}`;

      if (policy.fineMaxDays && calculation.daysOverdue > policy.fineMaxDays) {
        return `${description} (max days reached)`;
      }

      if (
        policy.fineCapAmount &&
        calculation.fineAmount >= policy.fineCapAmount
      ) {
        return `${description} (capped)`;
      }

      return `${description} (${calculation.daysOverdue} days)`;

    default:
      return `Late fee: ${formatFineAmount(calculation.fineAmount)}`;
  }
}

// Helper function to get fine policy from fee installment data
export function extractFinePolicy(installment: {
  fineType: FinePolicyType | null;
  fineAmount: number | null;
  fineMaxDays: number | null;
  fineCapAmount: number | null;
}): FinePolicy {
  return {
    fineType: installment.fineType,
    fineAmount: installment.fineAmount ? Number(installment.fineAmount) : null,
    fineMaxDays: installment.fineMaxDays
      ? Number(installment.fineMaxDays)
      : null,
    fineCapAmount: installment.fineCapAmount
      ? Number(installment.fineCapAmount)
      : null,
  };
}
