import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "./complaint-constants";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ComplaintStatusBanner({
  status,
  descriptionOverride,
}: {
  status: ComplaintStatus;
  descriptionOverride?: string | null;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Card className={cn("gap-3", cfg.color)}>
      <CardHeader>
        <CardTitle className="font-semibold">{cfg.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <span
          className={cn("size-2 shrink-0 rounded-full animate-pulse", cfg.dot)}
        />
        <div>
          <p className="mt-0.5 opacity-80">
            {descriptionOverride ?? cfg.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
