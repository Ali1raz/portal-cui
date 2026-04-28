import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export type InstallmentStatus = "paid" | "overdue" | "upcoming" | "near";

export const INSTALLMENT_STATUS_CONFIG: Record<
  InstallmentStatus,
  {
    label: string;
    variant: "secondary" | "destructive" | "warning" | "outline";
    icon: React.ElementType;
  }
> = {
  paid: {
    label: "Paid",
    variant: "secondary",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    variant: "destructive",
    icon: AlertCircle,
  },
  upcoming: {
    label: "Upcoming",
    variant: "outline",
    icon: Clock,
  },
  near: {
    label: "This week",
    variant: "warning",
    icon: Clock,
  },
};
