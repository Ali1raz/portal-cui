import { studentGetSubjectOverview } from "@/app/data/student/get-subject-overview";
import { Skeleton } from "@/components/ui/skeleton";

export async function SubjectOverview({ offeringId }: { offeringId: string }) {
  const subject = await studentGetSubjectOverview({ offeringId });

  return (
    <div className="flex items-baseline gap-6 flex-wrap">
      <div className="*:first:text-sm *:not-first:text-lg *:first:text-muted-foreground">
        <h1>Subject</h1>
        <span>{subject.subject.name}</span>
      </div>
      <div className="*:first:text-sm *:not-first:text-lg *:first:text-muted-foreground">
        <h1>Code</h1>
        <span>{subject.subject.code}</span>
      </div>
      <div className="*:first:text-sm *:not-first:text-lg *:first:text-muted-foreground">
        <h1>Credit Hours</h1>
        <p>{subject.subject.creditHours}</p>
      </div>
      <div className="*:first:text-sm *:not-first:text-lg *:first:text-muted-foreground">
        <h1>Total Lectures</h1>
        <p>{subject.totalLectures}</p>
      </div>
      <div className="*:first:text-sm *:not-first:text-lg *:first:text-muted-foreground">
        <h1>Leave request</h1>
        <p>{subject._count.leaveRequests}</p>
      </div>
    </div>
  );
}

export function SubjectOverviewSkeleton() {
  return (
    <div className="flex items-baseline gap-6 flex-wrap">
      <Skeleton className="w-32 h-14" />
      <Skeleton className="w-32 h-14" />
      <Skeleton className="w-32 h-14" />
      <Skeleton className="w-32 h-14" />
      <Skeleton className="w-32 h-14" />
    </div>
  );
}
