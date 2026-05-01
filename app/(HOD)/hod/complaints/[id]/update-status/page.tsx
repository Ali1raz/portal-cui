import { Metadata } from "next";
import { hodGetComplaintDetails } from "@/app/data/hod/get-complaint-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { UpdateComplaintStatusForm } from "./_components/update-status-form";
import { STATUS_CONFIG } from "@/components/complaints/complaint-constants";

export const metadata: Metadata = {
  title: "Update Complaint Status",
};

/// Page for HOD to update complaint status and remarks.
export default async function UpdateComplaintStatusPage(
  props: PageProps<"/hod/complaints/[id]/update-status">
) {
  const { id } = await props.params;
  const details = await hodGetComplaintDetails({ id });
  const statusCfg = STATUS_CONFIG[details.status];

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 px-4 md:px-6 my-6">
      <div>
        <h1 className="text-xl font-semibold">Update Complaint</h1>
        <p className="text-sm text-muted-foreground">
          Update the status and add remarks for this complaint.
        </p>
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
          <UpdateComplaintStatusForm
            complaintId={id}
            currentStatus={details.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}
