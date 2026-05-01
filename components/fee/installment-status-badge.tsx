import { Badge } from "@/components/ui/badge";
import {
  INSTALLMENT_STATUS_CONFIG,
  type InstallmentStatus,
} from "./installment-status-config";

interface InstallmentStatusBadgeProps {
  status: InstallmentStatus;
}

export function InstallmentStatusBadge({
  status,
}: InstallmentStatusBadgeProps) {
  const config = INSTALLMENT_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
