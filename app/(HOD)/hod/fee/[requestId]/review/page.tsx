import { hodGetFeeSplitRequestDetails } from "@/app/data/hod/get-fee-split-request-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import { formatFeeAmount } from "@/lib/utils/fee-format";
import { ReviewFeeSplitRequestForm } from "./_components/review-fee-split-request-form";

export default async function ReviewFeeSplitRequestPage(
  props: PageProps<"/hod/fee/[requestId]/review">
) {
  const { requestId } = await props.params;
  const details = await hodGetFeeSplitRequestDetails({ requestId });
  const studentName = details.student?.user.name ?? "Unknown Student";
  const registrationNo = details.student?.registrationNo ?? "-";

  const semester =
    details.feeInstallment?.semesterFee.semester ??
    details.studentFeeInstallment?.semesterFee.semester;
  const sourceInstallmentNo =
    details.feeInstallment?.installmentNo ??
    details.studentFeeInstallment?.orderNo;
  const sourceAmount =
    details.feeInstallment?.amount ??
    details.studentFeeInstallment?.amount ??
    0;
  const fullFeeAmount =
    details.feeInstallment?.semesterFee.totalAmount ??
    details.studentFeeInstallment?.semesterFee.totalAmount ??
    0;

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-xl font-semibold">Review Fee Split Request</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">{studentName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {registrationNo} · Submitted {formatDate(details.createdAt)}
              </p>
            </div>
            <Badge>{formatEnumLabel(details.status)}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Total fee" value={formatFeeAmount(fullFeeAmount)} />
            <InfoRow
              label="Requested instalment"
              value={formatFeeAmount(details.requestedAmount)}
            />
            <InfoRow
              label="Source installment no"
              value={String(sourceInstallmentNo ?? "-")}
            />
            <InfoRow
              label="Source amount"
              value={formatFeeAmount(sourceAmount)}
            />
            <InfoRow
              label="Preferred due date"
              value={formatDate(details.preferredDueDate)}
            />
            <InfoRow
              label="Semester"
              value={
                semester
                  ? `Sem ${semester.semester}: ${semester.batch}${semester.year
                      .toString()
                      .slice(-2)}-${semester.program}${semester.department}`
                  : "-"
              }
            />
          </div>

          <InfoRow
            label="Reason"
            value={details.reason}
            valueClassName="leading-6 text-muted-foreground"
          />

          <div className="border-t pt-6">
            <ReviewFeeSplitRequestForm requestId={details.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={valueClassName ?? "text-sm"}>{value}</p>
    </div>
  );
}
