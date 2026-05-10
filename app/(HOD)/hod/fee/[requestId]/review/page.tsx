import { hodGetFeeSplitRequestDetails } from "@/app/data/hod/get-fee-split-request-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import { formatFeeAmount } from "@/lib/utils/fee-format";
import { FeeInfoRow } from "@/components/fee/info-row";
import { ReviewFeeSplitRequestForm } from "./_components/review-fee-split-request-form";

export default async function ReviewFeeSplitRequestPage(
  props: PageProps<"/hod/fee/[requestId]/review">
) {
  const { requestId } = await props.params;
  const details = await hodGetFeeSplitRequestDetails({ requestId });

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-xl font-semibold">Review Fee Split Request</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {details.student?.user.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {details.student?.registrationNo}
                <span>{formatDate(details.createdAt)}</span>
              </p>
            </div>
            <Badge>{formatEnumLabel(details.status)}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FeeInfoRow
              label="Total fee"
              value={formatFeeAmount(details.totalFee)}
            />
            <FeeInfoRow
              label="Requested amount"
              value={formatFeeAmount(details.requestedAmount)}
            />

            <FeeInfoRow
              label="Preferred due date"
              value={formatDate(details.preferredDueDate)}
            />
          </div>

          <FeeInfoRow
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
