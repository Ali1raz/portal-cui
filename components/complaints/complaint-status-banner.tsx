import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "./complaint-constants";
import { Card, CardContent } from "../ui/card";

export function ComplaintStatusBanner({
  status,
  descriptionOverride,
}: {
  status: ComplaintStatus;
  descriptionOverride?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Card className={cn(cfg.color)}>
      <CardContent>
        <span
          className={cn("size-2 shrink-0 rounded-full animate-pulse", cfg.dot)}
        />
        <div>
          <p className="font-semibold text-sm">{cfg.label}</p>
          <p className="text-xs mt-0.5 opacity-80">
            {descriptionOverride ?? cfg.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
