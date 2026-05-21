import { studentGetInstallmentsPageData } from "@/app/data/student/st-get-installments-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatFeeAmount, formatFeeDate } from "@/lib/utils/fee-format";
import { IconCreditCard } from "@tabler/icons-react";
import { InstallmentActionsDropdown } from "./_components/installment-actions-dropdown";
import { FeeSplitRequestActionsDropdown } from "./_components/fee-split-request-actions-dropdown";
import { SITE_INFO } from "@/lib/data/SITE";
import {
  studentCanEditSplitRequest,
  studentCanDeleteSplitRequest,
  studentCanMarkPaidSplitRequest,
  studentCanPrintSplitRequest,
} from "./installment-split-request-constants";
import {
  INSTALLMENT_STATUS_CONFIG,
  type InstallmentStatus,
} from "@/components/fee/installment-status-config";
import { SplitRequestStatusBadge } from "@/components/fee/split-request-status-badge";
import { FineDisplay } from "@/components/fee/fine-display";
import { VoucherData } from "../_components/fee-voucher";

function getInstallmentStatus(
  dueDate: Date | string,
  status?: string
): InstallmentStatus {
  if (status === "PAID") return "paid";

  const now = new Date();
  const due = new Date(dueDate);
  if (due < now) return "overdue";
  const diff = due.getTime() - now.getTime();
  if (diff < 7 * 24 * 60 * 60 * 1000) return "near";
  return "upcoming";
}

export default async function Installments() {
  const data = await studentGetInstallmentsPageData();
  const today = new Date();

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

  const semesterLabel = data.semesterLabel;
  const feePageData = data;

  function createVoucherData(params: {
    voucherId: string;
    installmentNo: number;
    amount: number;
    dueDate: Date;
  }): VoucherData {
    return {
      voucherId: params.voucherId,
      installmentNo: params.installmentNo,
      amount: params.amount,
      dueDate: params.dueDate.toISOString(),
      printedAt: today.toISOString(),
      institutionName: SITE_INFO.institution_name,
      student: feePageData.student,
      semesterLabel,
    };
  }

  const feeInstallments = data.feeInstallments.map((inst) => ({
    ...inst,
    statusType: getInstallmentStatus(inst.dueDate, inst.status),
  }));

  const studentInstallments = data.displayedInstallments.map((inst) => ({
    id: inst.id,
    orderNo: inst.installmentNo,
    amount: inst.amount,
    dueDate: inst.dueDate,
    status: inst.status,
    updatedAt: inst.updatedAt,
    installmentSplitRequests: inst.installmentSplitRequests ?? [],
    statusType: getInstallmentStatus(inst.dueDate, inst.status),
    fineType: inst.fineType,
    fineAmount: inst.fineAmount,
    fineMaxDays: inst.fineMaxDays,
    fineCapAmount: inst.fineCapAmount,
  }));

  const feeSplitRequests = data.installmentSplitRequests.map(
    (request, index) => ({
      ...request,
      requestedAmount: Number(request.requestedAmount),
      requestNo: data.installmentSplitRequests.length - index,
    })
  );

  return (
    <div className="@container/main p-4 md:p-6 space-y-6">
      <h1>Your Installments</h1>

      {data.hasStudentInstallments ? (
        <Card>
          <CardHeader>
            <CardTitle>Student Installments</CardTitle>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentInstallments.map((inst) => {
                  const statusConfig =
                    INSTALLMENT_STATUS_CONFIG[inst.statusType];
                  const Icon = statusConfig.icon;

                  return (
                    <TableRow key={inst.id}>
                      <TableCell className="pl-6 font-mono text-muted-foreground">
                        {String(inst.orderNo).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {formatFeeAmount(inst.amount)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatFeeDate(inst.dueDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {inst.updatedAt ? formatFeeDate(inst.updatedAt) : "-"}
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
                          dueDate={inst.dueDate}
                          status={inst.status}
                          fineType={inst.fineType}
                          fineAmount={inst.fineAmount}
                          fineMaxDays={inst.fineMaxDays}
                          fineCapAmount={inst.fineCapAmount}
                        />
                      </TableCell>
                      <TableCell>
                        <InstallmentActionsDropdown
                          canPrintVoucher={inst.statusType !== "paid"}
                          canMarkPaid={inst.status !== "PAID"}
                          installmentId={inst.id}
                          voucherData={createVoucherData({
                            voucherId: inst.id,
                            installmentNo: inst.orderNo,
                            amount: inst.amount,
                            dueDate: inst.dueDate,
                          })}
                          filename={`fee-${data.id.slice(0, 6)}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fee Installments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-16">#</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fine Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeInstallments.map((inst) => {
                  const statusConfig =
                    INSTALLMENT_STATUS_CONFIG[inst.statusType];
                  const Icon = statusConfig.icon;

                  return (
                    <TableRow key={inst.id}>
                      <TableCell className="pl-6 font-mono text-muted-foreground">
                        {String(inst.installmentNo).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {formatFeeAmount(inst.amount)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatFeeDate(inst.dueDate)}
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
                          dueDate={inst.dueDate}
                          status={inst.status}
                          fineType={inst.fineType}
                          fineAmount={inst.fineAmount}
                          fineMaxDays={inst.fineMaxDays}
                          fineCapAmount={inst.fineCapAmount}
                        />
                      </TableCell>
                      <TableCell>
                        <InstallmentActionsDropdown
                          canPrintVoucher={inst.statusType !== "paid"}
                          voucherData={createVoucherData({
                            voucherId: inst.id,
                            installmentNo: inst.installmentNo,
                            amount: inst.amount,
                            dueDate: inst.dueDate,
                          })}
                          filename={`fee-${data.id.slice(0, 6)}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {feeSplitRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Split Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-16">#</TableHead>
                  <TableHead>Requested Amount</TableHead>
                  <TableHead>Preferred Due Date</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeSplitRequests.map((request) => {
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="pl-6 font-mono text-muted-foreground">
                        {String(request.requestNo).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {formatFeeAmount(request.requestedAmount)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatFeeDate(request.preferredDueDate)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatFeeDate(request.createdAt)}
                      </TableCell>
                      <TableCell>
                        <SplitRequestStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <FeeSplitRequestActionsDropdown
                          requestId={request.id}
                          installmentId={request.studentFeeInstallmentId}
                          canMarkPaid={studentCanMarkPaidSplitRequest(
                            request.status
                          )}
                          canPrintVoucher={studentCanPrintSplitRequest(
                            request.status
                          )}
                          voucherData={createVoucherData({
                            voucherId: request.id,
                            installmentNo: 1,
                            amount: request.requestedAmount,
                            dueDate: request.preferredDueDate,
                          })}
                          filename={`fee-split-${request.id.slice(0, 6)}`}
                          canEdit={studentCanEditSplitRequest(request.status)}
                          canDelete={studentCanDeleteSplitRequest(
                            request.status
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
