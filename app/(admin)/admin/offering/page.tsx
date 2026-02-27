import { getAdminOfferings } from "@/app/data/admin/get-offerings";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Suspense } from "react";
import type { OfferingSearchParams } from "@/app/(admin)/admin/offering/offering-search-params";
import { offeringSearchParamsCache } from "@/app/(admin)/admin/offering/offering-search-params";
import { OfferingsTable } from "./_components/offerings-table";

export default async function OfferingPage(
  props: PageProps<"/admin/offering">
) {
  return (
    <div className="@container/main">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">All Offerings</h1>
      </div>
      <Suspense fallback={<OfferingTableSkeleton />}>
        <OfferingList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function OfferingList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/offering">["searchParams"];
}) {
  const parsedParams: OfferingSearchParams =
    await offeringSearchParamsCache.parse(searchParams);
  const { offerings, totalCount } = await getAdminOfferings(parsedParams);

  return <OfferingsTable offerings={offerings} totalCount={totalCount} />;
}

function OfferingTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 8 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 8 }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
