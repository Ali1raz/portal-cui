import { getLeaveRequests } from "@/app/data/hod/get-leave-requests";
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
import { RequestActions } from "./_components/request-actions";

export default async function LeaveRequestsPage() {
  const requests = await getLeaveRequests();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <h1>
            Follwings are <span className="uppercase underline">pending</span>{" "}
            requests for leave, that need your approval.
          </h1>
          <div className="my-2 ">
            <Table>
              <TableCaption className="py-2">
                All Pending Leave Requests.
              </TableCaption>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Sr.</TableHead>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Requested for</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request, index: number) => (
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
                    <TableCell className="text-right">
                      <RequestActions leaveRequestId={request.id} />
                    </TableCell>
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
