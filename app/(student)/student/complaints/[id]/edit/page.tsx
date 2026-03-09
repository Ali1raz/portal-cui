import { studentGetComplaintDetails } from "@/app/data/student/get-complaint-details";
import { UpdateComplaintForm } from "./_components/update-complaint-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditComplaintPage(
  props: PageProps<"/student/complaints/[id]/edit">
) {
  const { id } = await props.params;
  const details = await studentGetComplaintDetails({ id });
  const isPending =
    details.status === "BA_PENDING" || details.status === "BA_REJECTED";

  return (
    <div className="px-4 md:px-6 max-w-6xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">Update Complaint</h1>
        <p className="text-muted-foreground text-sm">
          Update your complaint while it is still pending or needs revision.
        </p>
      </div>
      {isPending ? (
        <UpdateComplaintForm
          complaintId={id}
          initialValues={{
            title: details.title,
            details: details.details,
            category: details.category,
            imageKey: details.imageKey ?? "",
          }}
        />
      ) : (
        <div className="rounded-md border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Updates are no longer available.</p>
          <p className="text-muted-foreground">
            Only pending or returned complaints can be edited. Current status:{" "}
            <span className="font-medium text-foreground">
              {details.status}
            </span>
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/student/complaints/${id}`}>Back to complaint</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
