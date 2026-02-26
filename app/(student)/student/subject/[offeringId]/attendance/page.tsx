import { getStudentAttendances } from "@/app/data/student/get-student-attendances";
import AttendanceTable, {
  AttendanceTableSkeleton,
} from "./_components/attendance-table";
import { Suspense } from "react";
import {
  SubjectOverview,
  SubjectOverviewSkeleton,
} from "./_components/SubjectOverview";
import { Separator } from "@/components/ui/separator";
import {
  attendanceSearchParamsCache,
  type AttendanceSearchParams,
} from "./attendance-search-params";

export default async function StudentAttendancePage(
  props: PageProps<"/student/subject/[offeringId]/attendance">
) {
  const { offeringId } = await props.params;

  return (
    <div className="max-w-5xl w-full px-4 sm:px-6 my-6">
      <h1 className="text-lg font-semibold mb-4">My Attendance</h1>
      <div className="my-6">
        <Suspense fallback={<SubjectOverviewSkeleton />}>
          <SubjectOverview offeringId={offeringId} />
        </Suspense>
      </div>
      <Separator className="my-4" />
      <Suspense fallback={<AttendanceTableSkeleton />}>
        <AttendanceList
          offeringId={offeringId}
          searchParams={props.searchParams}
        />
      </Suspense>
    </div>
  );
}

/// Server wrapper for attendance table data.
async function AttendanceList({
  offeringId,
  searchParams,
}: {
  offeringId: string;
  searchParams: PageProps<"/student/subject/[offeringId]/attendance">["searchParams"];
}) {
  const parsedParams: AttendanceSearchParams =
    await attendanceSearchParamsCache.parse(searchParams);
  const { records, totalCount } = await getStudentAttendances({
    offeringId,
    ...parsedParams,
  });

  return <AttendanceTable rows={records} totalCount={totalCount} />;
}
