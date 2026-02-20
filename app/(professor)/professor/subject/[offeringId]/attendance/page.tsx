import { Suspense } from "react";
import { getProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import { AttendanceForm } from "./_components/attendance-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AttendencePage(
  props: PageProps<"/professor/subject/[offeringId]/attendance">
) {
  const { offeringId } = await props.params;

  return (
    <div className="flex flex-1 flex-col max-w-5xl">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex items-start sm:flex-row flex-col sm:justify-between justify-start gap-4">
            <h1>
              Manage attendance for class{" "}
              <span className="text-primary font-semibold">{offeringId}</span>
            </h1>
          </div>
          <Suspense fallback={<AttendanceTableSkeleton />}>
            <AttendenceTableInSuspense offeringId={offeringId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/// Loading skeleton for attendance table
function AttendanceTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="h-6 w-10" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-[200px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-[180px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-[220px]" />
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
              <Skeleton className="h-6 w-[220px]" />
              <Skeleton className="mt-2 h-4 w-[140px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[260px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function AttendenceTableInSuspense({
  offeringId,
}: {
  offeringId: string;
}) {
  const students = await getProfessorSectionStudents({ offeringId });

  return <AttendanceForm students={students} offeringId={offeringId} />;
}
