import { Metadata } from "next";
import Link from "next/link";
import { studentGetComplaintDetails } from "@/app/data/student/get-complaint-details";
import { GeneralImage } from "@/components/general/general-image";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { IconArrowLeft, IconEdit, IconPaperclip } from "@tabler/icons-react";
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
import { STATUS_CONFIG } from "@/components/complaints/complaint-constants";
import { ComplaintStatusBanner } from "@/components/complaints/complaint-status-banner";
import { ALREADY_REVIEWED_COMPLAINT_STATUS } from "@/lib/data/utils";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Complaint Details",
};

export default async function ComplaintDetailsPage(
  props: PageProps<"/student/complaints/[id]">
) {
  const { id } = await props.params;
  const details = await studentGetComplaintDetails({ id });

  const alreadyReviewed = ALREADY_REVIEWED_COMPLAINT_STATUS.includes(
    details.status
  );
  const statusCfg = STATUS_CONFIG[details.status];

  return (
    <div className="max-w-5xl w-full p-4 md:px-8 space-y-4">
      {/* ── Header ── */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        asChild
      >
        <Link href="/student/complaints">
          <IconArrowLeft size={14} />
          All Complaints
        </Link>
      </Button>
      <div className="space-y-4 flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight leading-tight">
            {details.title}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-4" />
            Submitted {formatDate(details.createdAt)}
          </p>
        </div>
        {!alreadyReviewed && (
          <Button className="w-fit" asChild>
            <Link href={`/student/complaints/${id}/edit`}>
              <IconEdit className="size-4" />
              Edit Complaint
            </Link>
          </Button>
        )}
      </div>

      {/* ── Status banner ── */}
      <ComplaintStatusBanner
        status={details.status}
        descriptionOverride={details.reviews[0].remarks}
      />

      {/* ── Main grid ── */}
      <div className="grid gap-6">
        <section className="lg:col-span-2 space-y-4">
          {/* Complaint content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Complaint</CardTitle>
              <CardDescription>{details.title}</CardDescription>
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
        </section>
      </div>
    </div>
  );
}
