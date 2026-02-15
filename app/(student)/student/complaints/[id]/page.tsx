import Link from "next/link";
import { studentGetComplaintDetails } from "@/app/data/student/get-complaint-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GeneralImage } from "@/components/general/general-image";
import { formatDate } from "@/lib/utils";
import { ComplaintStatus } from "@/lib/generated/prisma/enums";

const statusVariantMap: Record<
  ComplaintStatus,
  "warning" | "info" | "success" | "destructive"
> = {
  PENDING: "warning",
  ASSIGNED: "info",
  ACCEPTED: "success",
  REJECTED: "destructive",
};

export default async function ComplaintDetailsPage(
  props: PageProps<"/student/complaints/[id]">
) {
  const { id } = await props.params;
  const details = await studentGetComplaintDetails({ id });
  const canEdit = details.status === "PENDING";

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 px-4 md:px-6 my-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Complaint Details</h1>
          <p className="text-sm text-muted-foreground">
            Track your complaint status and response.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button size="sm" asChild>
              <Link href={`/student/complaints/${id}/edit`}>
                Update Complaint
              </Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Update Complaint
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/student/complaints">Back to complaints</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">{details.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted on {formatDate(details.createdAt)}
              </p>
            </div>
            <Badge
              variant={statusVariantMap[details.status]}
              appearance="light"
            >
              {details.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{details.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{details.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Department</p>
              <p className="font-medium">{details.targetDepartment}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Complaint Details
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {details.details}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              HOD Remarks
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {details.hodRemarks ?? "No remarks provided yet."}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Attachment
            </h2>
            {details.imageKey ? (
              <div className="relative max-w-[650px] rounded-md border p-2">
                <GeneralImage
                  src={details.imageKey}
                  alt="Complaint attachment"
                  width={600}
                  height={400}
                  className="aspect-video w-full rounded-md object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No attachment added.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
