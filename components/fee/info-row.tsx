interface FeeInfoRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function FeeInfoRow({ label, value, valueClassName }: FeeInfoRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm uppercase text-muted-foreground">{label}</p>
      <p className={valueClassName ?? "text-sm"}>{value}</p>
    </div>
  );
}
