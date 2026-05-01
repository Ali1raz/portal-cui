import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { hodGetComplaints } from "@/app/data/hod/get-complaints";
import { hodComplaintsSearchParamsCache } from "./complaints-search-params";
import { HodComplaintsTable } from "./_components/complaints-table";

export const metadata: Metadata = {
  title: "Complaints",
  description: "View and manage complaints from your department.",
};

/// HOD complaints list page with server-side filtering, sorting, and pagination.
export default async function HodComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = hodComplaintsSearchParamsCache.parse(await searchParams);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Department Complaints</h1>
          <p className="text-muted-foreground">
            View and manage complaints from your department students.
          </p>
        </div>
        <div className="my-2">
          <Suspense fallback={<ComplaintsTableSkeleton />}>
            <ComplaintsList params={parsedParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ComplaintsList({
  params,
}: {
  params: Awaited<ReturnType<typeof hodComplaintsSearchParamsCache.parse>>;
}) {
  const { complaints, totalCount } = await hodGetComplaints(params);

  return <HodComplaintsTable complaints={complaints} totalCount={totalCount} />;
}

/// Loading skeleton for complaints table.
function ComplaintsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-3">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-10" />
            </div>
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
