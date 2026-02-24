export function StatsCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="*:not-first:text-muted-foreground *:not-first:text-sm space-y-2">
      <p>{title}</p>
      <p>{value}</p>
    </div>
  );
}
