import { Suspense } from "react";
import { requireSession } from "@/app/data/session/require-session";
import { UserDetailsSection } from "@/components/user/user-details-section";
import { getHodDetails } from "./get-hod-details";
import { hodGetAtRiskStudents } from "@/app/data/hod/get-at-risk-students";
import { AtRiskStudentsTable } from "./_components/at-risk-students-table";
import { Skeleton } from "@/components/ui/skeleton";
import { atRiskStudentsSearchParamsCache } from "./at-risk-students-search-params";

/// HOD dashboard page with at-risk students overview.
export default async function HODPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const parsedParams = atRiskStudentsSearchParamsCache.parse(searchParams);

  const [session, hod] = await Promise.all([requireSession(), getHodDetails()]);

  const hodDetails = [{ label: "Department", value: hod.department }];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 p-4 md:py-6">
          <UserDetailsSection user={session.user} details={hodDetails} />
          <h1>
            Welcome back!{" "}
            <span className="font-bold text-primary">{session.user.name}</span>{" "}
            Here is your department overview.
          </h1>

          <section className="space-y-3" aria-labelledby="at-risk-heading">
            <div className="flex flex-col gap-2">
              <h2
                id="at-risk-heading"
                className="text-xl font-semibold tracking-tight"
              >
                At-Risk Students
              </h2>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Students below 80% effective attendance (Present + Leave) /
                Total — at risk of being debarred from exams. Intervene before
                it is too late.
              </p>
            </div>
            <Suspense fallback={<AtRiskStudentsTableSkeleton />}>
              <AtRiskStudentsList params={parsedParams} />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}

async function AtRiskStudentsList({
  params,
}: {
  params: Awaited<ReturnType<typeof atRiskStudentsSearchParamsCache.parse>>;
}) {
  const { students, totalCount } = await hodGetAtRiskStudents(params);
  return <AtRiskStudentsTable students={students} totalCount={totalCount} />;
}

/// Loading skeleton for at-risk students table.
function AtRiskStudentsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 flex-1 min-w-[220px]" />
      </div>

      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );
}
