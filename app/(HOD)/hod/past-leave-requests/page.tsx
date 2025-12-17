import { getPastLeaveRequests } from "@/app/data/hod/get-past-leave-requests";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function PastLeaveRequestsPage() {
  const requests = await getPastLeaveRequests();
  if (!requests.length) {
    return (
      <div className="text-muted-foreground">No leave requests found.</div>
    );
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <h1>All Past Leave Requests</h1>
          <div className="my-2 ">
            <Table>
              <TableCaption className="py-2">
                All Leave Requests (including processed).
              </TableCaption>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Sr.</TableHead>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Requested for</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request, index) => (
                  <TableRow className="group" key={request.id}>
                    <TableCell className="font-medium group-hover:text-primary">
                      {index + 1}
                    </TableCell>
                    <TableCell>{request.student.user.name}</TableCell>
                    <TableCell className="flex flex-col items-start max-w-[20ch] overflow-hidden text-ellipsis">
                      <span>{request.offering.subject.name}</span>
                      <span className="font-semibold">
                        {request.offering.subject.code}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(request.date)}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>{request.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
