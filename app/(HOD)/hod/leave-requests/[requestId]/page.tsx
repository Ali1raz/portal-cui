import { Metadata } from "next";
import { IconArrowLeft, IconClockHour4 } from "@tabler/icons-react";

import { getLeaveRequestDetails } from "@/app/data/hod/get-leave-request-details";
import { GeneralImage } from "@/components/general/general-image";
import { LeaveRequestStatusBanner } from "@/components/leave-requests/leave-request-status-banner";
import { LeaveRequestTimelineItem } from "@/components/leave-requests/leave-request-timeline-item";
import { UserImage } from "@/components/user/user-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/utils";
import { Suspense } from "react";
import { UpdateStatusDialog } from "./_components/update-status";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leave Request Details",
};

const REVIEWABLE_STATUSES: LeaveStatus[] = [LeaveStatus.HOD_PENDING];

export default async function HodLeaveRequestDetailsPage(
  props: PageProps<"/hod/leave-requests/[requestId]">
) {
  const { requestId } = await props.params;

  return (
    <div className="max-w-5xl w-full px-4 md:px-8 py-4 space-y-4 md:space-y-6">
      <Suspense fallback={<HodLeaveRequestDetailsSkeleton />}>
        <HodLeaveRequestDetailsContent requestId={requestId} />
      </Suspense>
    </div>
  );
}

async function HodLeaveRequestDetailsContent({
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

  const canReview = REVIEWABLE_STATUSES.includes(details.status);
  const reviews = details.reviews ?? [];
  const reviewCount = details._count?.reviews ?? reviews.length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            asChild
          >
            <Link href="/hod/leave-requests">
              <IconArrowLeft className="size-4" />
              All Leave Requests
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">
              {details.reasonTitle}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <IconClockHour4 className="size-4" />
              Submitted {formatDate(details.createdAt)}
            </p>
          </div>
        </div>

        {canReview && (
          <UpdateStatusDialog requestId={requestId} prevStatus={details.status}>
            <Button>Update Status</Button>
          </UpdateStatusDialog>
        )}
      </div>

      <LeaveRequestStatusBanner status={details.status} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <Card className="pb-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Leave Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>{details.status}</Badge>
                <Badge>{details.offering.subject.code}</Badge>
                <Badge>{formatDate(details.date)}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="font-medium">{details.offering.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Subject
                  </p>
                  <p className="font-medium">{details.offering.subject.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Leave Date
                  </p>
                  <p className="font-medium">{formatDate(details.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Credit Hours
                  </p>
                  <p className="font-medium">
                    {details.offering.subject.creditHours}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reason Details
                </p>
                <p className="text-sm whitespace-pre-wrap mt-1">
                  {details.reasonDetails}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {details.imageKey ? (
                <div className="rounded-lg border overflow-hidden max-w-lg">
                  <GeneralImage
                    src={details.imageKey}
                    alt="Leave request attachment"
                    width={600}
                    height={400}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ) : null}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center justify-between">
                Activity Timeline
                {reviewCount > 0 && (
                  <Badge size="md">
                    {reviewCount} {reviewCount === 1 ? "event" : "events"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            {reviews.length === 0 ? (
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Review this request to record the first activity.
                </p>
              </CardContent>
            ) : (
              <CardContent>
                {reviews.map((review, index) => (
                  <LeaveRequestTimelineItem
                    key={review.id}
                    review={review}
                    isLast={index === reviews.length - 1}
                    actorLabelOverride={{ HOD: "You" }}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <UserImage
                image={details.student.user.image}
                name={details.student.user.name}
              />
              <div>
                <p className="text-sm font-semibold">
                  {details.student.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {details.student.registrationNo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {details.student.department} Dept.
                </p>
              </div>
            </CardContent>
            <CardContent className="space-y-1 pt-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <p className="text-sm text-muted-foreground break-all">
                {details.student.user.email}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

/// Loading skeleton for HOD leave request details
function HodLeaveRequestDetailsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Status banner skeleton */}
      <Skeleton className="h-24 w-full rounded-lg" />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Leave details card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Timeline card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Student info */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
