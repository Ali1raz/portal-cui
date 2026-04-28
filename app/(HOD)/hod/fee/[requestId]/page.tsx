import Link from "next/link";
import { Suspense } from "react";
import { IconArrowLeft, IconClockHour4 } from "@tabler/icons-react";
import { ArrowRight } from "lucide-react";

import { hodGetFeeSplitRequestDetails } from "@/app/data/hod/get-fee-split-request-details";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserImage } from "@/components/user/user-image";
import { formatDate, formatEnumLabel } from "@/lib/utils";
import { formatFeeAmount } from "@/lib/utils/fee-format";
import { FeeInfoRow } from "@/components/fee/info-row";

export default async function HodFeeSplitRequestDetailsPage(
  props: PageProps<"/hod/fee/[requestId]">
) {
  const { requestId } = await props.params;

  return (
    <div className="max-w-8xl w-full p-4 md:px-8 space-y-4">
      <Suspense fallback={<HodFeeSplitRequestDetailsSkeleton />}>
        <HodFeeSplitRequestDetailsContent requestId={requestId} />
      </Suspense>
    </div>
  );
}

async function HodFeeSplitRequestDetailsContent({
  requestId,
}: {
  requestId: string;
}) {
  const details = await hodGetFeeSplitRequestDetails({ requestId });

  const semester =
    details.feeInstallment?.semesterFee.semester ??
    details.studentFeeInstallment?.semesterFee.semester ??
    details.feeContext?.semester;
  const sourceInstallmentNo =
    details.feeInstallment?.installmentNo ??
    details.studentFeeInstallment?.orderNo;
  const sourceAmount =
    details.feeInstallment?.amount ??
    details.studentFeeInstallment?.amount ??
    details.feeContext?.remainingAmount ??
    0;
  const fullFeeAmount =
    details.feeInstallment?.semesterFee.totalAmount ??
    details.studentFeeInstallment?.semesterFee.totalAmount ??
    details.feeContext?.totalAmount ??
    0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href="/hod/fee">
            <IconArrowLeft size={14} />
            Back to All Fee Requests
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Fee Split Request Details
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <IconClockHour4 className="size-4" />
            Submitted {formatDate(details.createdAt)}
          </p>
        </div>
        <Link
          href={`/hod/fee/${details.id}/review`}
          className={buttonVariants({ size: "sm" })}
        >
          Review this request
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <UserImage
              image={details.student?.user.image}
              name={details.student?.user.name}
            />
            <div>
              <p className="font-medium">{details.student?.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {details.student?.registrationNo}
              </p>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              {details.student?.user.email}
            </p>
            <p className="text-muted-foreground">
              {details.student?.department || ""} Department
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Request Summary
                <Badge>{formatEnumLabel(details.status)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <FeeInfoRow
                  label="Requested amount"
                  value={formatFeeAmount(details.requestedAmount)}
                />
                <FeeInfoRow
                  label="Preferred due date"
                  value={formatDate(details.preferredDueDate)}
                />
                <FeeInfoRow
                  label={
                    details.feeInstallment || details.studentFeeInstallment
                      ? "Source installment no"
                      : "Available amount"
                  }
                  value={
                    details.feeInstallment || details.studentFeeInstallment
                      ? String(sourceInstallmentNo ?? "-")
                      : formatFeeAmount(sourceAmount)
                  }
                />
                <FeeInfoRow
                  label={
                    details.feeInstallment || details.studentFeeInstallment
                      ? "Source amount"
                      : "Full fee amount"
                  }
                  value={formatFeeAmount(fullFeeAmount)}
                />
                <FeeInfoRow
                  label="Semester"
                  value={
                    semester
                      ? `Sem ${semester.semester} ${semester.batch}${String(semester.year).slice(-2)}-${semester.program ?? ""}${semester.department}`
                      : "-"
                  }
                />
              </div>

              <FeeInfoRow
                label="Reason"
                value={details.reason}
                valueClassName="leading-6 text-muted-foreground"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {details.reviews.length === 0 ? (
                <p className="text-muted-foreground">No activity yet.</p>
              ) : (
                details.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-md border p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-lg">
                      <p className="font-medium">
                        {formatEnumLabel(review.action)}
                      </p>
                      <p className="text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {formatEnumLabel(review.actorRole)} -{" "}
                      {formatEnumLabel(review.fromStatus)}
                      <ArrowRight className="size-4 inline mx-4" />
                      {formatEnumLabel(review.toStatus)}
                    </p>
                    {review.remarks ? (
                      <p className="text-sm text-muted-foreground leading-6">
                        {review.remarks}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function HodFeeSplitRequestDetailsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-44" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-5 w-52" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-44" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
