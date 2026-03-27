import { Suspense } from "react";
import { getClerkApplications } from "@/app/data/clerk/get-clerk-applications";
import {
  clerkApplicationsSearchParamsCache,
  type ClerkApplicationsSearchParams,
} from "./clerk-applications-search-params";
import { ClerkApplicationsTable } from "./_components/clerk-applications-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClerkApplicationsPage(
  props: PageProps<"/clerk/applications">
) {
  return (
    <div className="@container/main">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Applications</h1>
      </div>
      <Suspense fallback={<ClerkApplicationsTableSkeleton />}>
        <ClerkApplicationsList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function ClerkApplicationsList({
  searchParams,
}: {
  searchParams: PageProps<"/clerk/applications">["searchParams"];
}) {
  const parsedParams: ClerkApplicationsSearchParams =
    await clerkApplicationsSearchParamsCache.parse(searchParams);
  const { applications, totalCount } = await getClerkApplications(parsedParams);

  return (
    <ClerkApplicationsTable
      applications={applications}
      totalCount={totalCount}
    />
  );
}

function ClerkApplicationsTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 4 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-28" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 4 }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
