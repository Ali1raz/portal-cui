import { Suspense } from "react";
import { feeSearchParamsCache } from "./fee-search-params";
import { Skeleton } from "@/components/ui/skeleton";
import { accountantGetFees } from "@/app/data/accountant/acc-get-all-fee";
import { AccFeesTable } from "./_components/acc-fees-table";

async function AccFeesTableWrapper(props: {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const searchParams = await feeSearchParamsCache.parse(props.searchParams);

  const { fees, totalCount } = await accountantGetFees(searchParams);

  return <AccFeesTable fees={fees} totalCount={totalCount} />;
}

/// Loading skeleton for fees table
function FeesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-75" />
        <Skeleton className="h-10 w-35" />
        <Skeleton className="h-10 w-35" />
      </div>
      <div className="border rounded-md space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function ManageFeePage(props: {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Fee and Installments</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Create, view, and manage semester fees and installments
        </p>
      </div>

      <div className="w-full overflow-hidden flex flex-col gap-4 md:gap-6">
        <Suspense fallback={<FeesTableSkeleton />}>
          <AccFeesTableWrapper
            params={props.params}
            searchParams={props.searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
