import { getLeaveRequestDetails } from "@/app/data/hod/get-leave-request-details";
import { GeneralImage } from "@/components/general/general-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { UpdateStatusDialog } from "./_components/update-status";

export default async function LeaveRequestsPage(
  props: PageProps<"/hod/leave-requests/[requestId]">
) {
  const params = await props.params;
  const requestId = params.requestId;
  const details = await getLeaveRequestDetails(requestId);

  if (!details) {
    return <div>Details not found</div>;
  }

  console.log("Request ID:", requestId);
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Leave Request Details</CardTitle>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-4">
                <Card className="flex flex-col gap-2 p-4 border-primary ">
                  <CardTitle className="font-bold text-lg">
                    Date of Leave:
                  </CardTitle>
                  <p>{formatDate(details.date)}</p>
                </Card>
                <Card className="flex flex-col gap-2 p-4">
                  <CardTitle className="font-bold text-lg">
                    Created on:
                  </CardTitle>
                  <p>{formatDate(details.createdAt)}</p>
                </Card>
              </div>
              <CardDescription className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-lg">Title: </h2>
                  <p>{details.reasonTitle}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-lg">Reason Details: </h2>
                  <p className="text-base">{details.reasonDetails}</p>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {details?.imageKey && (
                <GeneralImage
                  src={details.imageKey}
                  alt="Leave Request Image"
                  width={600}
                  height={400}
                  className="rounded-md"
                />
              )}
              <Card className="p-2 flex flex-col gap-2 my-4">
                <h2 className="font-bold text-lg">Department: </h2>
                <p>{details.offering.department}</p>
              </Card>
              <Card className="p-2 flex flex-col gap-2">
                <h2 className="font-bold text-lg">Subject: </h2>
                <div className="text-sm flex flex-col gap-1">
                  <span>{details.offering.subject.name}</span>
                  <span>{details.offering.subject.code}</span>
                  <span>
                    Credit Hrs: {details.offering.subject.creditHours}
                  </span>
                  <span>Total Lect: {details.offering.totalLectures}</span>
                </div>
              </Card>
              <Separator className="my-4" />
              <section className="">
                <h2 className="font-bold text-lg mb-2">Student Info: </h2>
                <div className="flex items-center gap-4">
                  {details.student.user.image && (
                    <Image
                      src={details.student.user.image!}
                      alt="Student Image"
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-lg">
                      {details.student.user.name}
                    </span>
                    <span>Reg No: {details.student.registrationNo}</span>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
          <div className="mb-4">
            <UpdateStatusDialog
              requestId={requestId}
              prevStatus={details.status}
            >
              <Button>Update Request</Button>
            </UpdateStatusDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
