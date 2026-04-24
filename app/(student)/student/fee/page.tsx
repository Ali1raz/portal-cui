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
import Link from "next/link";
import { PrintAllVouchersButton } from "./_components/print-all";
import { PrintVoucherButton } from "./_components/print-voucher";
import { FullFeeVoucherData, VoucherData } from "./_components/fee-voucher";
import { Button } from "@/components/ui/button";
import { formatFeeAmount, formatFeeDate } from "@/lib/utils/fee-format";
import { SITE_INFO } from "@/lib/data/SITE";

export default async function FeePage() {
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

  const voucherDataList: VoucherData[] = data.displayedInstallments.map(
    (inst) => ({
      voucherId: inst.id,
      installmentNo: inst.installmentNo,
      amount: inst.amount,
      dueDate: new Date(inst.dueDate).toISOString(),
      printedAt: today.toISOString(),
      institutionName: SITE_INFO.institution_name,
      student: data.student,
    })
  );

  const installmentRows = data.installmentRows.map((row) => ({
    voucher: voucherDataList.find((v) => v.voucherId === row.id)!,
    rawInstallment: row,
    status: row.statusType,
    statusConfig: STATUS_CONFIG[row.statusType],
  }));

  const fullFeeVoucherData: FullFeeVoucherData = {
    voucherId: data.id,
    totalAmount: data.totalAmount,
    printedAt: today.toISOString(),
    institutionName: SITE_INFO.institution_name,
    installments: voucherDataList,
    student: data.student,
    semesterLabel: data.semesterLabel,
  };

  return (
    <div className="@container/main p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Details</h2>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="outline">
            <Link href="/student/fee/installments/new">Request Split</Link>
          </Button>
          <PrintAllVouchersButton
            data={fullFeeVoucherData}
            totalFeeId={data.id}
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        <Card className="bg-linear-to-br from-primary/10 to-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CreditCard className="size-3.5" />
              Total Fee
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {formatFeeAmount(data.totalAmount)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-linear-to-br from-blue-500/5 to-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              Installments
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {data.installmentCount}
              <span className="text-muted-foreground text-sm font-normal ml-1.5">
                total
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-linear-to-br from-emerald-500/5 to-card shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CreditCard className="size-3.5" />
              Remaining due
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {formatFeeAmount(data.remainingAmount)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Installments</CardTitle>
              <CardDescription className="mt-0.5">
                {data.installmentCount} installment
                {data.installmentCount !== 1 ? "s" : ""} scheduled
                {data.overdueCount > 0 && (
                  <span className="text-destructive ml-1.5">
                    · {data.overdueCount} overdue
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
              {installmentRows.map(
                ({ voucher, rawInstallment, statusConfig }) => {
                  const Icon = statusConfig.icon;

                  return (
                    <TableRow key={voucher.voucherId}>
                      <TableCell className="pl-6 font-mono text-muted-foreground">
                        {String(voucher.installmentNo).padStart(2, "0")}
                      </TableCell>

                      <TableCell className="font-semibold tabular-nums">
                        {formatFeeAmount(voucher.amount)}
                      </TableCell>

                      <TableCell className="tabular-nums text-sm">
                        {formatFeeDate(voucher.dueDate)}
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm">
                        {rawInstallment.updatedAt
                          ? formatFeeDate(rawInstallment.updatedAt)
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={statusConfig.variant}
                          className="gap-1 capitalize"
                        >
                          <Icon className="size-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>

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
                }
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

type InstallmentStatus = "paid" | "overdue" | "upcoming" | "near";

const STATUS_CONFIG: Record<
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
