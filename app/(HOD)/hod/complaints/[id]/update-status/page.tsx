import { hodGetComplaintDetails } from "@/app/data/hod/get-complaint-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { UpdateComplaintStatusForm } from "./_components/update-status-form";

/// Page for HOD to update complaint status and remarks.
export default async function UpdateComplaintStatusPage(
  props: PageProps<"/hod/complaints/[id]/update-status">
) {
  const { id } = await props.params;
  const details = await hodGetComplaintDetails({ id });

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 px-4 md:px-6 my-6">
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
            <Badge>{details.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <UpdateComplaintStatusForm
            complaintId={id}
            currentStatus={details.status}
            currentRemarks={details.hodRemarks}
          />
        </CardContent>
      </Card>
    </div>
  );
}
