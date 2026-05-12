import { studentGetFeeDetails } from "@/app/data/student/st-get-fee";
import { INSTALLMENT_STATUS_CONFIG } from "@/components/fee/installment-status-config";
import { FineDisplay } from "@/components/fee/fine-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { CreditCard, CalendarClock } from "lucide-react";
import Link from "next/link";
import { PrintAllVouchersButton } from "./_components/print-all";
import { formatFeeAmount, formatFeeDate } from "@/lib/utils/fee-format";
import { InstallmentActionsDropdown } from "./installments/_components/installment-actions-dropdown";

export default async function FeePage() {
  const { data } = await studentGetFeeDetails();

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

  const voucherByInstallmentId = new Map(
    data.voucherDataList.map((voucher) => [voucher.voucherId, voucher])
  );

  return (
    <div className="@container/main p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Details</h2>
          {data.semesterLabel && (
            <p className="text-muted-foreground text-sm mt-1">
              {data.semesterLabel}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            asChild
            size="sm"
            variant="outline"
            disabled={data.remainingAmount <= 0}
          >
            <Link href="/student/fee/installments/new">Request Split</Link>
          </Button>
          <PrintAllVouchersButton
            data={data.fullFeeVoucherData}
            totalFeeId={data.id}
          />
        </div>
      </div>

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

        <Card className="bg-linear-to-br from-blue-500/10 to-card shadow-xs">
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

        <Card className="bg-linear-to-br from-emerald-500/10 to-card shadow-xs">
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
                <TableHead>Fine Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.installmentRows.map((installment) => {
                const statusConfig =
                  INSTALLMENT_STATUS_CONFIG[installment.statusType];
                const Icon = statusConfig.icon;
                const voucher = voucherByInstallmentId.get(installment.id);

                return (
                  <TableRow key={installment.id}>
                    <TableCell className="pl-6 font-mono text-muted-foreground">
                      {String(installment.installmentNo).padStart(2, "0")}
                    </TableCell>

                    <TableCell className="font-semibold tabular-nums">
                      {formatFeeAmount(installment.amount)}
                    </TableCell>

                    <TableCell className="tabular-nums text-sm">
                      {formatFeeDate(installment.dueDate)}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {installment.updatedAt
                        ? formatFeeDate(installment.updatedAt)
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

                    <TableCell>
                      <FineDisplay
                        dueDate={installment.dueDate}
                        status={installment.status}
                        fineType={installment.fineType}
                        fineAmount={installment.fineAmount}
                        fineMaxDays={installment.fineMaxDays}
                        fineCapAmount={installment.fineCapAmount}
                      />
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end">
                        {voucher && (
                          <InstallmentActionsDropdown
                            canPrintVoucher={installment.status !== "PAID"}
                            voucherData={voucher}
                            filename={`fee-${data.id.slice(0, 6)}`}
                          />
                        )}
                      </div>
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
