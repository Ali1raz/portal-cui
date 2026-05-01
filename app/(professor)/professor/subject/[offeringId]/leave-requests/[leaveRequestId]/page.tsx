import { Metadata } from "next";
import { professorGetLeaveRequestDetails } from "@/app/data/professor/get-leave-request-details";
import { GeneralImage } from "@/components/general/general-image";
import { UserImage } from "@/components/user/user-image";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leave Request Details",
};

export default async function ProfessorLeaveRequestDetailsPage(
  props: PageProps<"/professor/subject/[offeringId]/leave-requests/[leaveRequestId]">
) {
  const { leaveRequestId } = await props.params;
  const details = await professorGetLeaveRequestDetails({ id: leaveRequestId });

  return (
    <div className="flex flex-1 flex-col max-w-4xl w-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:py-6">
          <div className="flex items-start sm:flex-row flex-col sm:justify-between justify-start gap-4">
            <h1 className="text-xl">
              Leave Request details for{" "}
              <span className="text-primary font-semibold">
                {details.student.user.name}
              </span>
            </h1>
            <UserImage
              image={details.student.user.image}
              name={details.student.user.name}
              className="size-20"
            />
          </div>
          <h1 className="text-xl font-bold">Application Details</h1>
          <div className="flex items-baseline gap-5 flex-wrap">
            <div className="*:first:text-sm *:not-first:text-muted-foreground *:not-first:text-lg">
              <h1>Create on</h1>
              <p>{formatDate(details.createdAt)}</p>
            </div>
            <div className="*:first:text-sm *:not-first:text-muted-foreground *:not-first:text-lg">
              <h1>Leave Date</h1>
              <p>{formatDate(details.date)}</p>
            </div>
            <div className="*:first:text-sm *:not-first:text-muted-foreground *:not-first:text-lg">
              <h1>Status</h1>
              <p>{details.status}</p>
            </div>
          </div>
          <div className="flex items-baseline gap-5 flex-wrap">
            <div className="*:first:text-sm *:not-first:text-muted-foreground *:not-first:text-lg">
              <h1>Total leave requests</h1>
              <p>{details.student._count.leaveRequests}</p>
            </div>
          </div>
          <h1 className="text-xl font-bold">Student Details</h1>
          <div className="flex flex-wrap gap-5 items-baseline">
            <div className="*:first:text-sm *:not-first:text-muted-foreground *:not-first:text-lg">
              <h1>Name</h1>
              <p className="flex items-center gap-2">
                {details.student.user.name}
              </p>
            </div>
            <div className="*:first:text-sm *:not-first:text-muted-foreground *:not-first:text-lg">
              <h1>Registration Nr</h1>
              <p>{details.student.registrationNo}</p>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-start gap-5">
              <h1 className="text-xl font-bold">More Details</h1>
              <div className="*:first:text-lg *:not-first:text-muted-foreground *:not-first:text-sm">
                <h1>Title</h1>
                <p>{details.reasonTitle}</p>
              </div>
              <div className="*:first:text-lg *:not-first:text-muted-foreground *:not-first:text-sm">
                <h1>Description</h1>
                <p>{details.reasonDetails}</p>
              </div>
              <div className="*:first:text-lg *:not-first:text-muted-foreground">
                <h1>Attachment</h1>
                <div className="max-w-[650px] relative border my-4">
                  {details.imageKey ? (
                    <GeneralImage
                      src={details.imageKey}
                      alt="Leave Request Image"
                      width={600}
                      height={400}
                      className="object-cover rounded-md aspect-video"
                    />
                  ) : (
                    <p className="w-full h-full flex items-center justify-center text-lg">
                      No attachment added.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
