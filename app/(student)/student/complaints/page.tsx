import { studentsGetComplaints } from "@/app/data/student/get-complaints";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplaintsCard } from "./_components/complaints-card";
import Link from "next/link";
import { Suspense } from "react";
import {
  complaintsSearchParamsCache,
  type ComplaintsSearchParams,
} from "./complaints-search-params";

/// Loading skeleton for complaints cards.
function ComplaintsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function StudentsComplaintsPage(
  props: PageProps<"/student/complaints">
) {
  return (
    <div className="@container/main p-4 space-y-4">
      <div className="flex sm:justify-between sm:flex-row items-baseline flex-col gap-4">
        <h2 className="text-2xl font-bold">Complaints</h2>
        <Link
          href="/student/complaints/new"
          className={buttonVariants({ size: "sm" })}
        >
          New Complaint
        </Link>
      </div>
      <Suspense fallback={<ComplaintsTableSkeleton />}>
        <ComplaintsList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

/// Server wrapper for complaints table data.
async function ComplaintsList({
  searchParams,
}: {
  searchParams: PageProps<"/student/complaints">["searchParams"];
}) {
  const parsedParams: ComplaintsSearchParams =
    await complaintsSearchParamsCache.parse(searchParams);
  const { complaints, totalCount } = await studentsGetComplaints(parsedParams);

  return (
    <div className="space-y-3">
      <p>{totalCount} complaints found.</p>
      <section className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {complaints.map((complaint) => (
          <ComplaintsCard key={complaint.id} complaint={complaint} />
        ))}
      </section>
    </div>
  );
}
