import { StudentLeaveRequest } from "@/app/data/student/get-leave-requests";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface Props {
  requests: StudentLeaveRequest[];
}

export function LeaveRequestsTable({ requests }: Props) {
  if (!requests.length) {
    return (
      <div className="text-muted-foreground">No leave requests found.</div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Created On</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((req) => (
          <TableRow key={req.id}>
            <TableCell>{req.offering.subject.name}</TableCell>
            <TableCell>{req.reasonTitle}</TableCell>
            <TableCell>{req.date ? formatDate(req.date) : "-"}</TableCell>
            <TableCell>{formatDate(req.createdAt)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  req.status === "PENDING"
                    ? "secondary"
                    : req.status === "APPROVED"
                      ? "success"
                      : req.status === "REJECTED"
                        ? "destructive"
                        : "outline"
                }
              >
                {req.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
