import { studentGetFeeDetails } from "@/app/data/student/st-get-fee";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { IconCreditCard } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

import {
  CreditCard,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { PrintAllVouchersButton } from "./_components/print-all";
import { PrintVoucherButton } from "./_components/print-voucher";
import { FullFeeVoucherData, VoucherData } from "./_components/fee-voucher";

export default async function FeePAge() {
  const data = await studentGetFeeDetails();

  if (!data) {
    return (
      <div className="@container/main p-6 flex items-center justify-center mt-24 min-h-64">
        <div className="text-center space-y-4">
          <IconCreditCard className="size-24 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-lg">No fee details found.</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const totalAmount = Number(data.totalAmount);
  const installmentCount = data._count.feeInstallments;

  // Build VoucherData array (sorted by installment number)
  const voucherDataList: VoucherData[] = data.feeInstallments
    .slice()
    .sort((a, b) => a.installmentNo - b.installmentNo)
    .map((inst) => ({
      voucherId: inst.id,
      installmentNo: inst.installmentNo,
      amount: Number(inst.amount),
      dueDate: new Date(inst.dueDate).toISOString(),
      printedAt: today.toISOString(),
      institutionName: "CUI Vehari portal",
    }));

  const fullFeeVoucherData: FullFeeVoucherData = {
    voucherId: data.id,
    totalAmount,
    printedAt: today.toISOString(),
    institutionName: "CUI Vehari portal",
    installments: voucherDataList,
  };

  // Summary stats
  const overdueCount = voucherDataList.filter(
    (v) => getInstallmentStatus(v.dueDate) === "overdue"
  ).length;

  return (
    <div className="@container/main p-4 md:p-6 space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Details</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Printed on {formatDate(today)}
          </p>
        </div>

        {/* Print all — client component */}
        <PrintAllVouchersButton
          data={fullFeeVoucherData}
          totalFeeId={data.id}
        />
      </div>

      <Separator />

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        {/* Total fee */}
        <Card className="bg-linear-to-br from-primary/10 to-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CreditCard className="size-3.5" />
              Total Fee
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {formatAmount(totalAmount)}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Installments */}
        <Card className="bg-linear-to-br from-blue-500/10 to-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              Installments
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {installmentCount}
              <span className="text-muted-foreground text-sm font-normal ml-1.5">
                total
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* ── Installments table ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Installments</CardTitle>
              <CardDescription className="mt-0.5">
                {installmentCount} installment
                {installmentCount !== 1 ? "s" : ""} scheduled
                {overdueCount > 0 && (
                  <span className="text-destructive ml-1.5">
                    · {overdueCount} overdue
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-16">#</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherDataList.map((voucher) => {
                const status = getInstallmentStatus(voucher.dueDate);
                const cfg = STATUS_CONFIG[status];
                const Icon = cfg.icon;
                const rawInst = data.feeInstallments.find(
                  (i) => i.id === voucher.voucherId
                )!;

                return (
                  <TableRow key={voucher.voucherId}>
                    {/* # */}
                    <TableCell className="pl-6 font-mono text-muted-foreground">
                      {String(voucher.installmentNo).padStart(2, "0")}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-semibold tabular-nums">
                      {formatAmount(voucher.amount)}
                    </TableCell>

                    {/* Due date */}
                    <TableCell className="tabular-nums text-sm">
                      {formatDate(voucher.dueDate)}
                    </TableCell>

                    {/* Updated at */}
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(rawInst.updatedAt)}
                    </TableCell>

                    {/* Status badge */}
                    <TableCell>
                      <Badge variant={cfg.variant} className="gap-1 capitalize">
                        <Icon className="size-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>

                    {/* Print voucher */}
                    <TableCell className="pr-6 text-right">
                      <PrintVoucherButton
                        data={voucher}
                        variant="outline"
                        label="Print Voucher"
                        filename={`fee-${data.id.slice(0, 6)}`}
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatAmount(amount: unknown): string {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "PKR",
  });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type InstallmentStatus = "paid" | "overdue" | "upcoming";

function getInstallmentStatus(dueDate: Date | string): InstallmentStatus {
  const now = new Date();
  const due = new Date(dueDate);
  if (due < now) return "overdue";
  const diff = due.getTime() - now.getTime();
  if (diff < 7 * 24 * 60 * 60 * 1000) return "upcoming"; // within a week
  return "upcoming";
}

const STATUS_CONFIG: Record<
  InstallmentStatus,
  {
    label: string;
    variant: "secondary" | "destructive" | "warning";
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
    variant: "warning",
    icon: Clock,
  },
};
