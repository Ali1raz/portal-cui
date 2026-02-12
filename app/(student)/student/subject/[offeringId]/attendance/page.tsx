import { getStudentAttendances } from "@/app/data/student/get-student-attendances";
import AttendanceTable from "./_components/attendance-table";
import { Suspense } from "react";
import {
  SubjectOverview,
  SubjectOverviewSkeleton,
} from "./_components/SubjectOverview";
import { Separator } from "@/components/ui/separator";

export default async function StudentAttendancePage(
  props: PageProps<"/student/subject/[offeringId]/attendance">
) {
  const { offeringId } = await props.params;

  const records = await getStudentAttendances({
    offeringId,
  });

  return (
    <div className="max-w-5xl w-full px-4 sm:px-6 my-6">
      <h1 className="text-lg font-semibold mb-4">My Attendance</h1>
      <div className="my-6">
        <Suspense fallback={<SubjectOverviewSkeleton />}>
          <SubjectOverview offeringId={offeringId} />
        </Suspense>
      </div>
      <Separator className="my-4" />
      <Suspense fallback={<div>Loading...</div>}>
        <AttendanceTable
          rows={records}
          total={records.length}
          offeringId={offeringId}
        />
      </Suspense>
    </div>
  );
}
