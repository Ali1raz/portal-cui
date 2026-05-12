import { Metadata } from "next";
import { Suspense } from "react";
import { getProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import { AttendanceForm } from "../../../attendance/_components/attendance-form";
import { getLectureDetails } from "@/app/data/professor/get-lectures";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Update Subject Attendance",
  description: "Update attendance for a specific lecture.",
};

export default async function UpdateAttendancePage(
  props: PageProps<"/professor/subject/[offeringId]/lectures/[recordId]/edit">
) {
  const { offeringId, recordId } = await props.params;

  return (
    <div className="flex flex-1 flex-col max-w-5xl">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <h1>Update attendance for lecture</h1>

          <Suspense fallback={<AttendanceTableSkeleton />}>
            <AttendenceTableInSuspense
              offeringId={offeringId}
              recordId={recordId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function AttendanceTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="h-6 w-10" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-50" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-45" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-55" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="size-10 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-55" />
              <Skeleton className="mt-2 h-4 w-35" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-65" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function AttendenceTableInSuspense({
  offeringId,
  recordId,
}: {
  offeringId: string;
  recordId: string;
}) {
  const [students, lecture] = await Promise.all([
    getProfessorSectionStudents({ offeringId }),
    getLectureDetails({ recordId, offeringId }),
  ]);

  if (!lecture) return notFound();

  // Convert attendees to a map
  const attendancesRecord: Record<string, AttendanceStatus> = {};
  lecture.attendances.forEach((att) => {
    attendancesRecord[att.student.id] = att.status as AttendanceStatus;
  });

  const initialData = {
    recordId: lecture.id,
    topic: lecture.topic,
    date: lecture.date,
    startTime: lecture.startTime,
    endTime: lecture.endTime,
    attendances: attendancesRecord,
  };

  return (
    <AttendanceForm
      students={students}
      offeringId={offeringId}
      initialData={initialData}
    />
  );
}
