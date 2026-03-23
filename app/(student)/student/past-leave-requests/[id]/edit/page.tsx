import { getStudentLeaveRequestDetails } from "@/app/data/student/get-leave-request-details";
import { getStudentEnrolledSubjects } from "@/app/data/student/get-subjects-enrolled";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EDITABLE_LEAVE_REQUEST_STATUS } from "@/lib/data/utils";
import { UpdateLeaveRequestForm } from "../../_components/update-leave-request-form";

export default async function EditLeaveRequestPage(
  props: PageProps<"/student/past-leave-requests/[id]/edit">
) {
  const { id } = await props.params;
  const [details, { subjects }] = await Promise.all([
    getStudentLeaveRequestDetails({ id }),
    getStudentEnrolledSubjects(),
  ]);

  const isEditable = EDITABLE_LEAVE_REQUEST_STATUS.includes(details.status);

  return (
    <div className="px-4 md:px-6 max-w-6xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">Update Leave Request</h1>
      </div>
      {isEditable ? (
        <UpdateLeaveRequestForm
          leaveRequestId={id}
          subjects={subjects}
          initialValues={{
            subjectId: details.offering.subject.id,
            date: details.date,
            reasonTitle: details.reasonTitle,
            reasonDetails: details.reasonDetails,
            imageKey: details.imageKey ?? "",
          }}
        />
      ) : (
        <div className="rounded-md border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Updates are no longer available.</p>
          <p className="text-muted-foreground">
            This leave request cannot be edited anymore. Current status:{" "}
            <span className="font-medium text-foreground">
              {details.status}
            </span>
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/student/past-leave-requests/${id}`}>
                Back to request
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
