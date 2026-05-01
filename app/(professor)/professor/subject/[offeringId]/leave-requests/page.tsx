import { Metadata } from "next";
import { professorGetLeaveRequests } from "@/app/data/professor/get-leave-requests";
import { ProfessorLeaveRequestsTable } from "./_components/professor-leave-requests-table";
import type { LeaveRequestsSearchParams } from "./leave-requests-search-params";
import { leaveRequestsSearchParamsCache } from "./leave-requests-search-params";

export const metadata: Metadata = {
  title: "Subject Leave Requests",
  description: "View and manage leave requests submitted for this subject.",
};

export default async function LeaveRequests(
  props: PageProps<"/professor/subject/[offeringId]/leave-requests">
) {
  const { offeringId } = await props.params;
  const parsedParams: LeaveRequestsSearchParams =
    await leaveRequestsSearchParamsCache.parse(props.searchParams);
  const { leaveRequests, totalCount } = await professorGetLeaveRequests({
    offeringId,
    ...parsedParams,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex items-start sm:flex-row flex-col sm:justify-between justify-start gap-4">
            <h1>
              Total{" "}
              <span className="text-primary font-semibold">{totalCount}</span>{" "}
              leave requests
            </h1>
          </div>
          <ProfessorLeaveRequestsTable
            requests={leaveRequests}
            totalCount={totalCount}
            offeringId={offeringId}
          />
        </div>
      </div>
    </div>
  );
}
