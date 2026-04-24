import {
  studentGetFeeDetails,
  type InstallmentStatus,
  type StudentInstallment,
} from "@/app/data/student/st-get-fee";
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
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { IconCreditCard } from "@tabler/icons-react";
import { InstallmentActionsDropdown } from "./_components/installment-actions-dropdown";
import type { VoucherData } from "../_components/fee-voucher";
import { SITE_INFO } from "@/lib/data/SITE";

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

type StudentInstallmentRow = Omit<StudentInstallment, "updatedAt"> & {
  updatedAt: Date | null;
};

function getInstallmentStatus(
  dueDate: Date | string,
  status?: string
): InstallmentStatus {
  if (status === "PAID") return "paid";
  if (status === "OVERDUE") return "overdue";

  const now = new Date();
  const due = new Date(dueDate);
  if (due < now) return "overdue";
  const diff = due.getTime() - now.getTime();
  if (diff < 7 * 24 * 60 * 60 * 1000) return "near";
  return "upcoming";
}

export default async function Installments() {
  const data = await studentGetFeeDetails();
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

  const splitRequestByFeeInstallmentId = new Map(
    data.installmentSplitRequests
      .filter((request) => Boolean(request.feeInstallmentId))
      .map((request) => [request.feeInstallmentId as string, request])
  );
  const studentInfo = data.student;

  function canDeleteRequest(status: string) {
    return (
      status === "PENDING" || status === "HOD_REJECTED" || status === "REJECTED"
    );
  }

  function canMarkPaidRequest(status: string) {
    return status === "HOD_APPROVED" || status === "APPROVED";
  }

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
      student: studentInfo,
    };
  }

  const feeInstallments = data.feeInstallments.map((inst) => ({
    ...inst,
    statusType: getInstallmentStatus(inst.dueDate, inst.status),
  }));

  const studentInstallments: StudentInstallmentRow[] =
    data.studentFeeInstallments.map((inst) => ({
      ...inst,
      statusType: getInstallmentStatus(inst.dueDate, inst.status),
      updatedAt: inst.updatedAt,
      installmentSplitRequests: inst.installmentSplitRequests,
    }));

  // If student installments exist and only 1, add remaining as second
  if (data.hasStudentInstallments && studentInstallments.length === 1) {
    const firstInstallment = studentInstallments[0];
    const secondDueDate = new Date(
      firstInstallment.dueDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    studentInstallments.push({
      id: "remaining",
      orderNo: 2,
      amount: data.remainingAmount,
      dueDate: secondDueDate,
      status: "UNPAID",
      updatedAt: null,
      installmentSplitRequests: [],
      statusType: getInstallmentStatus(secondDueDate, "UNPAID"),
    });
  }

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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentInstallments.map((inst) => {
                  const statusConfig = STATUS_CONFIG[inst.statusType];
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
                        {inst.installmentSplitRequests &&
                        inst.installmentSplitRequests.length > 0 ? (
                          <InstallmentActionsDropdown
                            requestId={inst.installmentSplitRequests[0].id}
                            voucherData={createVoucherData({
                              voucherId: inst.id,
                              installmentNo: inst.orderNo,
                              amount: inst.amount,
                              dueDate: inst.dueDate,
                            })}
                            filename={`fee-${data.id.slice(0, 6)}`}
                            canDelete={canDeleteRequest(
                              inst.installmentSplitRequests[0].status
                            )}
                            canMarkPaid={canMarkPaidRequest(
                              inst.installmentSplitRequests[0].status
                            )}
                          />
                        ) : null}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeInstallments.map((inst) => {
                  const statusConfig = STATUS_CONFIG[inst.statusType];
                  const Icon = statusConfig.icon;
                  const splitRequest = splitRequestByFeeInstallmentId.get(
                    inst.id
                  );

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
                        {splitRequest ? (
                          <InstallmentActionsDropdown
                            requestId={splitRequest.id}
                            voucherData={createVoucherData({
                              voucherId: inst.id,
                              installmentNo: inst.installmentNo,
                              amount: inst.amount,
                              dueDate: inst.dueDate,
                            })}
                            filename={`fee-${data.id.slice(0, 6)}`}
                            canDelete={canDeleteRequest(splitRequest.status)}
                            canMarkPaid={canMarkPaidRequest(
                              splitRequest.status
                            )}
                          />
                        ) : null}
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
