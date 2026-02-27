import { studentGetSubjectOverview } from "@/app/data/student/get-subject-overview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export async function SubjectOverview({ offeringId }: { offeringId: string }) {
  const { subject, _count, totalLectures, attendanceStats } =
    await studentGetSubjectOverview({
      offeringId,
    });

  return (
    <div className="flex items-start flex-wrap gap-2">
      <section className="w-full sm:max-w-[250px]">
        <h1>Subject</h1>
        <Card>
          <CardHeader>
            <CardTitle>{subject.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              <Badge>Code: {subject.code}</Badge>
              <Badge>Creds: {subject.creditHours}</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="w-full sm:max-w-[250px]">
        <h1>More Details</h1>
        <Card>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p>Total Lectures</p>
              <p className="text-muted-foreground">{totalLectures}</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Leave requests</p>
              <p className="text-muted-foreground">{_count.leaveRequests}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="w-full sm:max-w-[250px]">
        <h1>Attendance Stats</h1>
        <Card>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p>Total records</p>
              <p className="text-muted-foreground">
                {attendanceStats.totalRecords}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p>Present</p>
              <p className="text-muted-foreground">
                {attendanceStats.presentCount}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p>Absentees</p>
              <p className="text-muted-foreground">
                {attendanceStats.absentCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function SubjectOverviewSkeleton() {
  return (
    <div className="flex items-start flex-wrap gap-2">
      <Card className="w-full ">
        <CardContent>
          <Skeleton className="w-full h-8" />
          <div className="flex items-center mt-4 gap-1.5">
            <Skeleton className="w-16 h-6 mt-2" />
            <Skeleton className="w-16 h-6 mt-1" />
          </div>
        </CardContent>
      </Card>
      <Card className="w-full ">
        <CardContent>
          <Skeleton className="w-full h-8" />
          <div className="flex items-center mt-4 gap-1.5">
            <Skeleton className="w-16 h-6 mt-2" />
            <Skeleton className="w-16 h-6 mt-1" />
          </div>
        </CardContent>
      </Card>
      <Card className="w-full ">
        <CardContent>
          <Skeleton className="w-full h-8" />
          <div className="flex items-center mt-4 gap-1.5">
            <Skeleton className="w-16 h-6 mt-2" />
            <Skeleton className="w-16 h-6 mt-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
