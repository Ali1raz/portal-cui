import { Metadata } from "next";
import { Suspense } from "react";
import { getOfferingLectures } from "@/app/data/professor/get-lectures";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LecturesTable } from "./_components/lectures-table";

export const metadata: Metadata = {
  title: "Subject Lectures",
  description: "View past lectures and attendances.",
};

export default async function LecturesPage(
  props: PageProps<"/professor/subject/[offeringId]/lectures">
) {
  const { offeringId } = await props.params;

  return (
    <div className="flex flex-1 flex-col max-w-5xl">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1>Past Lectures</h1>
            <Button asChild>
              <Link href={`/professor/subject/${offeringId}/attendance`}>
                Mark New Attendance
              </Link>
            </Button>
          </div>

          <Suspense fallback={<LecturesTableSkeleton />}>
            <LecturesTableInSuspense offeringId={offeringId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function LecturesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 flex-1 min-w-56" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function LecturesTableInSuspense({ offeringId }: { offeringId: string }) {
  const lectures = await getOfferingLectures({ offeringId });

  if (!lectures || lectures.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No lectures recorded yet.
      </div>
    );
  }

  return (
    <LecturesTable
      lectures={lectures}
      offeringId={offeringId}
      totalCount={lectures.length}
    />
  );
}
