export function formatFeeAmount(amount: unknown): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "PKR 0.00";
  }

  const absoluteAmount = Math.abs(numericAmount);
  const formattedAbsoluteAmount = absoluteAmount
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = numericAmount < 0 ? "-" : "";

  return `${sign}PKR ${formattedAbsoluteAmount}`;
}

export function formatFeeDate(
  date: Date | string | undefined,
  monthStyle: "short" | "long" = "short"
): string {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: monthStyle,
    day: "numeric",
  });
}
