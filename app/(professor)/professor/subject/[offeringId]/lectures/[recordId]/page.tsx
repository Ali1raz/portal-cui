import { Metadata } from "next";
import { Suspense } from "react";
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
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserImage } from "@/components/user/user-image";
import { ProfAttendanceChart } from "../_components/prof-attendance-chart";

export const metadata: Metadata = {
  title: "Lecture Details",
  description: "View attendance details for this lecture.",
};

export default async function LectureDetailsPage(
  props: PageProps<"/professor/subject/[offeringId]/lectures/[recordId]">
) {
  const { offeringId, recordId } = await props.params;

  return (
    <div className="flex flex-1 flex-col max-w-5xl">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <Suspense fallback={<LectureDetailsSkeleton />}>
            <LectureDetailsInSuspense
              offeringId={offeringId}
              recordId={recordId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LectureDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Registration No</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="size-10 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

async function LectureDetailsInSuspense({
  offeringId,
  recordId,
}: {
  offeringId: string;
  recordId: string;
}) {
  const lecture = await getLectureDetails({ recordId, offeringId });

  if (!lecture) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-start items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lecture.topic}</h1>
          <div className="mt-2 text-muted-foreground flex flex-col gap-1">
            <p>
              Date:{" "}
              <span className="font-medium text-foreground">
                {formatDate(lecture.date.toISOString())}
              </span>
            </p>
            <p>
              Time:{" "}
              <span className="font-medium text-foreground">
                {lecture.startTime} - {lecture.endTime}
              </span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link
            href={`/professor/subject/${offeringId}/lectures/${recordId}/edit`}
          >
            Edit Attendance
          </Link>
        </Button>
      </div>

      {/*  */}

      <ProfAttendanceChart
        absentCount={
          lecture.attendances.filter((a) => a.status === "ABSENT").length
        }
        leaveCount={
          lecture.attendances.filter((a) => a.status === "LEAVE").length
        }
        presentCount={
          lecture.attendances.filter((a) => a.status === "PRESENT").length
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Registration No</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lecture.attendances.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell>
                  <UserImage
                    image={attendance.student.user.image}
                    name={attendance.student.user.name}
                  />
                </TableCell>
                <TableCell className="font-medium flex flex-col gap-1">
                  <span>{attendance.student.user.name}</span>
                  <span
                    className={`font-medium ${
                      attendance.attendancePercentage < 80
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {attendance.attendancePercentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {attendance.student.registrationNo}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      attendance.status === "PRESENT"
                        ? "success"
                        : attendance.status === "ABSENT"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {attendance.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
