import { StudentComplaintsRow } from "@/app/data/student/get-complaints";
import { STATUS_CONFIG } from "@/components/complaints/complaint-constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, getRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { ComplaintActions } from "./complaint-actions";

export function ComplaintsCard({
  complaint,
}: {
  complaint: StudentComplaintsRow;
}) {
  const cfg = STATUS_CONFIG[complaint.status];

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base line-clamp-2">
          <Link
            href={`/student/complaints/${complaint.id}`}
            className=" hover:underline underline-offset-4"
          >
            {complaint.title}
          </Link>
        </CardTitle>
        <CardDescription>
          <p className="line-clamp-2">{complaint.details}</p>
          <div className="flex items-center flex-wrap gap-2 mt-3">
            <Badge className={cn(cfg.color)}>{cfg.label}</Badge>
            <Badge>{complaint.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {getRelativeTime(new Date(complaint.createdAt))}
            </span>
          </div>
        </CardDescription>
        <CardAction>
          <ComplaintActions
            complaintId={complaint.id}
            status={complaint.status}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
