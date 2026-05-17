import { studentGetSubjectOverview } from "@/app/data/student/get-subject-overview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePieChart } from "./attendance-pie-chart";

export async function SubjectOverview({ offeringId }: { offeringId: string }) {
  const { subject, attendanceStats } = await studentGetSubjectOverview({
    offeringId,
  });

  return (
    <div className="flex items-start flex-wrap gap-3">
      <section className="w-full sm:max-w-62.5">
        <Card className="gap-3">
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

      <section className="w-full sm:max-w-62.5">
        <Card>
          <CardContent className="space-y-3">
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

      <section className="w-full">
        <Card>
          <CardContent>
            <AttendancePieChart
              presentCount={attendanceStats.presentCount}
              absentCount={attendanceStats.absentCount}
              leaveCount={attendanceStats.leaveCount}
            />
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
      <Card className="w-full ">
        <CardContent>
          <Skeleton className="h-60 w-full" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
