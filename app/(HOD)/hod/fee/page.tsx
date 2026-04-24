import { Suspense } from "react";

import {
  hodGetFeeSplitRequests,
  hodGetFeeSplitSemesterOptions,
} from "@/app/data/hod/get-fee-split-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { HodFeeSplitRequestsTable } from "./_components/fee-split-requests-table";
import { hodFeeSplitSearchParamsCache } from "./fee-split-requests-search-params";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function HodFeePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = hodFeeSplitSearchParamsCache.parse(await searchParams);

  return (
    <div className="@container/main space-y-4 p-6 md:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Fee Installment Requests</h1>
          <p className="text-muted-foreground">
            Review installment split requests from your department.
          </p>
        </div>

        <Link
          href="/hod/fee/edit"
          className={buttonVariants({ size: "sm", className: "w-fit" })}
        >
          Edit installments
        </Link>

        <Suspense fallback={<FeeSplitRequestsTableSkeleton />}>
          <FeeSplitRequestsWrapper params={parsedParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function FeeSplitRequestsWrapper({
  params,
}: {
  params: Awaited<ReturnType<typeof hodFeeSplitSearchParamsCache.parse>>;
}) {
  const [{ requests, totalCount }, semesters] = await Promise.all([
    hodGetFeeSplitRequests(params),
    hodGetFeeSplitSemesterOptions(),
  ]);

  return (
    <HodFeeSplitRequestsTable
      requests={requests}
      totalCount={totalCount}
      semesters={semesters}
    />
  );
}

function FeeSplitRequestsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 flex-1 min-w-55" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="rounded-md border p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
