import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { baGetLeaveRequestDetails } from "@/app/data/professor/get-ba-leave-request-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/utils";

import { UpdateStatusForm } from "./_components/update-status-form";

const REVIEWABLE_STATUSES: LeaveStatus[] = [
  LeaveStatus.PENDING,
  LeaveStatus.REVIEW_REQUESTED,
];

export default async function BaUpdateLeaveRequestStatusPage(
  props: PageProps<"/batch-advisor/leave-requests/[id]/update-status">
) {
  const { id } = await props.params;
  const details = await baGetLeaveRequestDetails({ id });
  const canReview = REVIEWABLE_STATUSES.includes(details.status);

  if (!canReview) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        This leave request has already been reviewed and cannot be updated.
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 px-4 md:px-8 my-6">
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href={`/batch-advisor/leave-requests/${id}`}>
            <IconArrowLeft className="size-4" />
            Back to Details
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-semibold">Update Leave Request Status</h1>
          <p className="text-sm text-muted-foreground">
            Decide whether to request more info, reject, or forward to HOD.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{details.reasonTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Submitted by {details.student.user.name} on{" "}
            {formatDate(details.createdAt)}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <UpdateStatusForm leaveRequestId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
