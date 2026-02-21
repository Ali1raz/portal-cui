import { getLeaveRequestDetails } from "@/app/data/hod/get-leave-request-details";
import { GeneralImage } from "@/components/general/general-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Suspense } from "react";
import { UpdateStatusDialog } from "./_components/update-status";
import { StatsCard } from "@/components/general/stats";
import { UserImage } from "@/components/user/user-image";

export default async function LeaveRequestsPage(
  props: PageProps<"/hod/leave-requests/[requestId]">
) {
  const { requestId } = await props.params;

  return (
    <div className="@container/main p-4 space-y-4">
      <div className="flex sm:justify-between sm:flex-row items-baseline flex-col gap-4">
        <h2 className="text-2xl font-bold">Leave Request Details</h2>
      </div>
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
        <Suspense fallback={<LeaveRequestDetailsSkeleton />}>
          <LeaveRequestDetailsContent requestId={requestId} />
        </Suspense>
      </div>
    </div>
  );
}

async function LeaveRequestDetailsContent({
  requestId,
}: {
  requestId: string;
}) {
  const details = await getLeaveRequestDetails(requestId);

  if (!details) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Leave request not found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <StatsCard title="Status" value={details.status} />
        <StatsCard title="Created on" value={formatDate(details.createdAt)} />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="font-bold text-lg">Title: </h2>
          <p className="text-base">{details.reasonTitle}</p>
        </div>
        <div className="space-y-2">
          <h2 className="font-bold text-lg">Reason Details: </h2>
          <p className="text-base">{details.reasonDetails}</p>
        </div>
      </div>

      <div className="my-4">
        {details?.imageKey && (
          <GeneralImage
            src={details.imageKey}
            alt="Leave Request Image"
            width={600}
            height={400}
            className="rounded-md"
          />
        )}
        <Separator className="my-4" />

        <section className="my-4 flex flex-wrap gap-4">
          <StatsCard title="Department" value={details.offering.department} />
          <StatsCard title="Subject" value={details.offering.subject.name} />
          <StatsCard
            title="Subject Code"
            value={details.offering.subject.code}
          />
          <StatsCard
            title="Credit Hours"
            value={details.offering.subject.creditHours}
          />
          <StatsCard
            title="Total Lectures"
            value={details.offering.totalLectures}
          />
        </section>
        <Separator className="my-8" />
        <section>
          <h2 className="font-bold text-lg mb-2">Student Info: </h2>
          <div className="flex items-center gap-4">
            {details.student.user.image && (
              <UserImage
                image={details.student.user.image!}
                className="rounded-none size-16"
              />
            )}
            <div>
              <p className="font-medium">{details.student.user.name}</p>
              <p className="font-medium">{details.student.registrationNo}</p>
            </div>
          </div>
        </section>
      </div>
      <div className="my-8">
        <UpdateStatusDialog requestId={requestId} prevStatus={details.status}>
          <Button>Update Request</Button>
        </UpdateStatusDialog>
      </div>
    </div>
  );
}

/// Loading skeleton for leave request details
function LeaveRequestDetailsSkeleton() {
  return (
    <div className="@container/main p-4 space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center max-w-2xl gap-y-4">
            <Card className="flex flex-col gap-2 p-4 border-primary w-full sm:w-auto">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
            </Card>
            <Card className="flex flex-col gap-2 p-4 w-full sm:w-auto">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-24" />
            </Card>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full max-w-2xl" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full max-w-[600px] rounded-md mb-4" />
          <Card className="p-2 flex flex-col gap-2 my-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-5 w-16" />
          </Card>
          <Card className="p-2 flex flex-col gap-2">
            <Skeleton className="h-6 w-20" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
          </Card>
          <Separator className="my-4" />
          <section>
            <Skeleton className="h-6 w-32 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-[100px] w-[100px] rounded-md" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
      <div className="mb-4">
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
