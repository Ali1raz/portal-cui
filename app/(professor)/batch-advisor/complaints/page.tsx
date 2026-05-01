import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { baGetComplaints } from "@/app/data/professor/get-ba-complaints";
import { baComplaintsSearchParamsCache } from "./ba-complaints-search-params";
import { BaComplaintsTable } from "./_components/ba-complaints-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave requests",
  description: "Manage complaints of your department.",
};

/// Batch Advisor complaints list page with server-side filtering, sorting, and pagination.
export default async function BaComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = baComplaintsSearchParamsCache.parse(await searchParams);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">Batch Advisor Complaints</h1>
            <p className="text-muted-foreground text-sm">
              View and manage complaints from your batch students.
            </p>
          </div>
          <div className="my-2">
            <Suspense fallback={<ComplaintsTableSkeleton />}>
              <ComplaintsList params={parsedParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ComplaintsList({
  params,
}: {
  params: Awaited<ReturnType<typeof baComplaintsSearchParamsCache.parse>>;
}) {
  const { complaints, totalCount } = await baGetComplaints(params);

  return <BaComplaintsTable complaints={complaints} totalCount={totalCount} />;
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
