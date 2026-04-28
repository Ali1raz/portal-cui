import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/utils";
import { SplitRequestStatus } from "@/lib/generated/prisma/enums";
import { SPLIT_REQUEST_STATUS_BADGE_CONFIG } from "./split-request-status-config";

interface SplitRequestStatusBadgeProps {
  status: SplitRequestStatus;
}

export function SplitRequestStatusBadge({
  status,
}: SplitRequestStatusBadgeProps) {
  const variant = SPLIT_REQUEST_STATUS_BADGE_CONFIG[status] ?? "outline";

  return (
    <Badge variant={variant} className="w-fit">
      {formatEnumLabel(status)}
    </Badge>
  );
}
