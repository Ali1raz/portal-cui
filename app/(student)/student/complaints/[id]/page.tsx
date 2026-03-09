import Link from "next/link";
import { studentGetComplaintDetails } from "@/app/data/student/get-complaint-details";
import { GeneralImage } from "@/components/general/general-image";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  IconArrowLeft,
  IconEdit,
  IconPaperclip,
  IconClockHour4,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserImage } from "@/components/user/user-image";

import { STATUS_CONFIG } from "@/components/complaints/complaint-constants";
import { ComplaintStatusBanner } from "@/components/complaints/complaint-status-banner";
import { ComplaintTimelineItem } from "@/components/complaints/complaint-timeline-item";
import { ComplaintMetaRow } from "@/components/complaints/complaint-meta-row";

export default async function ComplaintDetailsPage(
  props: PageProps<"/student/complaints/[id]">
) {
  const { id } = await props.params;
  const details = await studentGetComplaintDetails({ id });

  const canEdit =
    details.status === "BA_PENDING" || details.status === "BA_REJECTED";
  const statusCfg = STATUS_CONFIG[details.status];

  return (
    <div className="mx-auto max-w-5xl w-full p-4 space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 text-muted-foreground"
            asChild
          >
            <Link href="/student/complaints">
              <IconArrowLeft size={14} className="mr-1" />
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
            {canEdit && (
              <Button size="sm" asChild>
                <Link href={`/student/complaints/${id}/edit`}>
                  <IconEdit size={14} className="mr-1.5" />
                  Edit Complaint
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
        <section className="lg:col-span-2 space-y-4">
          {/* Complaint content */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint</CardTitle>
              <CardDescription>{details.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{details.details}</p>
            </CardContent>
            <CardFooter>
              {details.imageKey ? (
                <div className="rounded-lg border overflow-hidden max-w-lg">
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
                    actorLabelOverride={{ STUDENT: "You" }}
                  />
                ))}
              </CardContent>
            ) : (
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your Batch Advisor will review this shortly.
                </p>
              </CardContent>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ComplaintMetaRow label="Category" value={details.category} />
              <ComplaintMetaRow
                label="Department"
                value={details.targetDepartment}
              />
            </CardContent>
            <CardFooter className="space-y-2 flex flex-col items-start">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Status
              </p>
              <Badge
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  statusCfg.color
                )}
              >
                <span className={cn("size-1.5 rounded-full", statusCfg.dot)} />
                {statusCfg.label}
              </Badge>
            </CardFooter>
          </Card>

          {/* BA info */}
          {details.batchAdvisor && (
            <Card className="space-y-5">
              <CardHeader>
                <CardTitle>Batch Advisor</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                {details.batchAdvisor.user.image ? (
                  <UserImage
                    image={details.batchAdvisor.user.image}
                    name={details.batchAdvisor.user.name}
                  />
                ) : (
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                    {details.batchAdvisor.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {details.batchAdvisor.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {details.batchAdvisor.department} Dept.
                  </p>
                </div>
              </CardContent>
              {details.baRemarks && (
                <CardContent className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Remarks
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">{`"${details.baRemarks}"`}</p>
                </CardContent>
              )}
              {details.baReviewedAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <IconClockHour4 size={11} />
                  Reviewed {formatDate(details.baReviewedAt)}
                </p>
              )}
            </Card>
          )}

          {/* HOD remarks */}
          {details.hodRemarks && (
            <Card>
              <CardHeader>
                <CardTitle>HOD Remarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {`"${details.hodRemarks}"`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Department transfers */}
          {details.assignments.length > 0 && (
            <Card className="space-y-5">
              <CardHeader>
                <CardTitle>Transfers</CardTitle>
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
