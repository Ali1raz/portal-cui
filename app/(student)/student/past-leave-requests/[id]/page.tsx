import { Metadata } from "next";
import { getStudentLeaveRequestDetails } from "@/app/data/student/get-leave-request-details";
import { GeneralImage } from "@/components/general/general-image";
import { LeaveRequestStatusBanner } from "@/components/leave-requests/leave-request-status-banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  IconArrowLeft,
  IconClockHour4,
  IconEdit,
  IconPaperclip,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EDITABLE_LEAVE_REQUEST_STATUS } from "@/lib/data/utils";

export const metadata: Metadata = {
  title: "Leave Request Details",
};

export default async function LeaveRequestDetailsPage(
  props: PageProps<"/student/past-leave-requests/[id]">
) {
  const { id } = await props.params;
  const details = await getStudentLeaveRequestDetails({ id });

  const isEditable = EDITABLE_LEAVE_REQUEST_STATUS.includes(details.status);

  return (
    <div className="max-w-5xl w-full p-4 md:px-8 space-y-4">
      {/* ── Header ── */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        asChild
      >
        <Link href="/student/past-leave-requests">
          <IconArrowLeft size={14} />
          All Leave Requests
        </Link>
      </Button>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight leading-tight">
            {details.reasonTitle}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <IconClockHour4 size={13} />
            Submitted {formatDate(details.createdAt)}
          </p>
        </div>

        {isEditable && (
          <Button size="sm" asChild>
            <Link href={`/student/past-leave-requests/${details.id}/edit`}>
              <IconEdit size={14} className="mr-1.5" />
              Edit Request
            </Link>
          </Button>
        )}
      </div>

      <LeaveRequestStatusBanner
        status={details.status}
        descriptionOverride={details.reviews[0]?.remarks || undefined}
      />

      {/* ── Main grid ── */}
      <div className="grid gap-6">
        {/* Leave details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Leave Request</CardTitle>
            <CardDescription>{details.reasonTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{details.status}</Badge>
              <Badge>{details.offering.subject.code}</Badge>
              <Badge>{formatDate(details.date)}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Subject
              </p>
              <p className="font-medium mt-1">
                {details.offering.subject.name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Leave Date
              </p>
              <p className="font-medium mt-1">{formatDate(details.date)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reason Details
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap mt-1">
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
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <IconPaperclip size={11} />
                No attachment
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
