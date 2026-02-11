import { cn } from "@/lib/utils";

export function MiddleTruncateText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const maxLength = 20;
  const truncated =
    text.length > maxLength ? `${text.slice(0, 13)}...${text.slice(-7)}` : text;

  return (
    <div className={cn("truncate", className)} title={text}>
      {truncated}
    </div>
  );
}

// Usage
//   <MiddleTruncateText text={reasonTitle} />
