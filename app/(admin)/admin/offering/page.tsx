import { Metadata } from "next";
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
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offerings",
  description:
    "Manage subject offerings, teacher assignments, and semester coverage.",
};

export default async function OfferingPage(
  props: PageProps<"/admin/offering">
) {
  return (
    <div className="@container/main">
      <div className="flex sm:items-center sm:justify-between items-start flex-col sm:flex-row gap-4 mb-5">
        <h1 className="text-2xl font-bold">All Subject Offerings</h1>
        <Link href={"/admin/offering/create"} className={buttonVariants()}>
          New offering
        </Link>
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
  const { offerings, totalCount, semesterOptions } =
    await getAdminOfferings(parsedParams);

  return (
    <OfferingsTable
      offerings={offerings}
      totalCount={totalCount}
      semesterOptions={semesterOptions}
    />
  );
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
