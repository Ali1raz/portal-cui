import { Metadata } from "next";
import { IconArrowLeft, IconClockHour4 } from "@tabler/icons-react";

import { baGetLeaveRequestDetails } from "@/app/data/professor/get-ba-leave-request-details";
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
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leave Request Details",
};

const REVIEWABLE_STATUSES: LeaveStatus[] = [
  LeaveStatus.PENDING,
  LeaveStatus.REVIEW_REQUESTED,
];

export default async function BaLeaveRequestDetailsPage(
  props: PageProps<"/batch-advisor/leave-requests/[id]">
) {
  const { id } = await props.params;
  const details = await baGetLeaveRequestDetails({ id });
  const canReview = REVIEWABLE_STATUSES.includes(details.status);

  return (
    <div className="max-w-5xl w-full px-4 md:px-8 py-4 space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            asChild
          >
            <Link href="/batch-advisor/leave-requests">
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
          <Button asChild>
            <Link
              href={`/batch-advisor/leave-requests/${details.id}/update-status`}
            >
              Update Status
            </Link>
          </Button>
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
                {details._count.reviews > 0 && (
                  <Badge size="md">
                    {details._count.reviews}{" "}
                    {details._count.reviews === 1 ? "event" : "events"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            {details.reviews.length === 0 ? (
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Update the status to record the first activity.
                </p>
              </CardContent>
            ) : (
              <CardContent>
                {details.reviews.map((review, index) => (
                  <LeaveRequestTimelineItem
                    key={review.id}
                    review={review}
                    isLast={index === details.reviews.length - 1}
                    actorLabelOverride={{ BATCH_ADVISOR: "You" }}
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
