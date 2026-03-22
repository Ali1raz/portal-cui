import Link from "next/link";
import { baGetComplaintDetails } from "@/app/data/professor/get-ba-complaint-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { GeneralImage } from "@/components/general/general-image";
import { UserImage } from "@/components/user/user-image";
import { formatDate } from "@/lib/utils";
import {
  IconArrowLeft,
  IconClockHour4,
  IconPaperclip,
  IconEdit,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

import { STATUS_CONFIG } from "@/components/complaints/complaint-constants";
import { ComplaintStatusBanner } from "@/components/complaints/complaint-status-banner";
import { ComplaintTimelineItem } from "@/components/complaints/complaint-timeline-item";

/// Batch Advisor complaint details page.
export default async function BaComplaintDetailsPage(
  props: PageProps<"/batch-advisor/complaints/[id]">
) {
  const { id } = await props.params;
  const details = await baGetComplaintDetails({ id });

  const statusCfg = STATUS_CONFIG[details.status];
  const canReview = details.status === "BA_PENDING";

  return (
    <div className="max-w-5xl w-full px-4 md:px-8 py-4 space-y-4 md:space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            asChild
          >
            <Link href="/batch-advisor/complaints">
              <IconArrowLeft className="size-4" />
              All Complaints
            </Link>
          </Button>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight leading-tight">
                {details.title}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <IconClockHour4 className="size-4" />
                Submitted {formatDate(details.createdAt)}
              </p>
            </div>
            {canReview && (
              <Button size="sm" asChild>
                <Link href={`/batch-advisor/complaints/${id}/update-status`}>
                  <IconEdit className="size-4" />
                  Update Status
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status banner ── */}
      <ComplaintStatusBanner status={details.status} />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── Left: Meta sidebar ── */}
        <section className="lg:col-span-2 space-y-4">
          {/* Complaint content */}
          <Card className="pb-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "items-center gap-1.5 py-1 text-xs font-medium ring-1",
                    statusCfg.color
                  )}
                >
                  <span
                    className={cn("size-1.5 rounded-full", statusCfg.dot)}
                  />
                  {statusCfg.label}
                </Badge>
                <Badge>{details.category}</Badge>
                <Badge>{details.targetDepartment}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {details.details}
              </p>
            </CardContent>
            <CardFooter>
              {details.imageKey ? (
                <div className="relative rounded-lg border overflow-hidden max-w-lg">
                  <GeneralImage
                    src={details.imageKey}
                    alt="Complaint attachment"
                    width={600}
                    height={400}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <IconPaperclip size={11} />
                  No attachment
                </p>
              )}
            </CardFooter>
          </Card>

          {/* Timeline */}
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

            {details.reviews.length > 0 ? (
              <CardContent>
                {details.reviews.map((review, idx) => (
                  <ComplaintTimelineItem
                    key={review.id}
                    review={review}
                    isLast={idx === details.reviews.length - 1}
                    actorLabelOverride={{ BATCH_ADVISOR: "You" }}
                  />
                ))}
              </CardContent>
            ) : (
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Update the status to record the first activity.
                </p>
              </CardContent>
            )}
          </Card>
        </section>

        {/* ── Right ── */}
        <section className="space-y-4">
          {/* Student info */}
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
                <p className="text-sm font-semibold truncate">
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
            <CardContent className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <p className="text-sm text-muted-foreground">
                {details.student.user.email}
              </p>
            </CardContent>
          </Card>

          {/* Department transfers */}
          {details.assignments.length > 0 && (
            <Card className="space-y-5">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.assignments.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                        {a.fromDepartment}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                        {a.toDepartment}
                      </span>
                    </div>
                    {a.reason && (
                      <p className="text-xs text-muted-foreground pl-1 italic">
                        {a.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pl-1">
                      {formatDate(a.assignedAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
