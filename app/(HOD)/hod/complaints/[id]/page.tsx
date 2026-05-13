import { Metadata } from "next";
import Link from "next/link";
import { hodGetComplaintDetails } from "@/app/data/hod/get-complaint-details";
import type { HodComplaintDetails } from "@/app/data/hod/get-complaint-details";
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
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Complaint Details",
};

export default async function HodComplaintDetailsPage(
  props: PageProps<"/hod/complaints/[id]">
) {
  const { id } = await props.params;
  const details: HodComplaintDetails = await hodGetComplaintDetails({ id });
  const reviewCount = details.reviews.length;

  const statusCfg = STATUS_CONFIG[details.status];
  const canReview = details.status === "HOD_PENDING";

  return (
    <div className="w-full p-4 md:px-8 space-y-4">
      {/* ── Header ── */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href="/hod/complaints">
            <IconArrowLeft size={14} />
            All Complaints
          </Link>
        </Button>
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">
              {details.title}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <IconClockHour4 size={13} />
              Submitted {formatDate(details.createdAt)}
            </p>
          </div>
          {canReview && (
            <Button size="sm" asChild>
              <Link href={`/hod/complaints/${id}/update-status`}>
                <IconEdit size={14} className="mr-1.5" />
                Review Complaint
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Status banner ── */}
      <ComplaintStatusBanner status={details.status} />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── Left: Complaint + Timeline ── */}
        <section className="lg:col-span-2 space-y-4">
          {/* Complaint content */}
          <Card>
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
              <CardTitle className="flex items-center justify-between">
                Activity Timeline
                {reviewCount > 0 && (
                  <Badge size="md">
                    {reviewCount} {reviewCount === 1 ? "event" : "events"}
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
                    actorLabelOverride={{ HOD: "You" }}
                  />
                ))}
              </CardContent>
            ) : (
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use &apos;Review Complaint&apos; to record the first action.
                </p>
              </CardContent>
            )}
          </Card>
        </section>

        {/* ── Right: Sidebar ── */}
        <section>
          {/* Student info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.assignments.map((a) => (
                  <div key={a.id} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <ArrowRight />
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
