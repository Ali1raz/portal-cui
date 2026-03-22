import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { BaUpdateComplaintStatusForm } from "./_components/update-status-form";
import { baGetComplaintForUpdate } from "@/app/data/professor/get-ba-comp-for-update";
import { STATUS_CONFIG } from "@/components/complaints/complaint-constants";
import { ALREADY_REVIEWED_COMPLAINT_STATUS } from "@/lib/data/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default async function BaUpdateComplaintStatusPage(
  props: PageProps<"/batch-advisor/complaints/[id]/update-status">
) {
  const { id } = await props.params;
  const details = await baGetComplaintForUpdate({ id });
  const statusCfg = STATUS_CONFIG[details.status];
  const alreadyReviewed = ALREADY_REVIEWED_COMPLAINT_STATUS.includes(
    details.status
  );

  if (alreadyReviewed) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        This complaint has already been reviewed and cannot be updated.
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
          <Link href={`/batch-advisor/complaints/${id}`}>
            <IconArrowLeft className="size-4" />
            Back to Details
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Update Status</h1>
          <p className="text-sm text-muted-foreground">
            Update the status and add remarks for this complaint.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">{details.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted by {details.student.user.name} on{" "}
                {formatDate(details.createdAt)}
              </p>
            </div>
            <Badge
              className={cn(
                "items-center gap-1.5 py-1 text-xs font-medium ring-1",
                statusCfg.color
              )}
            >
              <span className={cn("size-1.5 rounded-full", statusCfg.dot)} />
              {statusCfg.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <BaUpdateComplaintStatusForm
            complaintId={id}
            currentStatus={details.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}
