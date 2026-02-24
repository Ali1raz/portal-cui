import { studentsGetComplaints } from "@/app/data/student/get-complaints";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComplaintsTable } from "./_components/complaints-table";
import Link from "next/link";
import { Suspense } from "react";
import {
  complaintsSearchParamsCache,
  type ComplaintsSearchParams,
} from "./complaints-search-params";

/// Loading skeleton for complaints table.
function ComplaintsTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 7 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 7 }).map((_, cellIndex) => (
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

  return <ComplaintsTable complaints={complaints} totalCount={totalCount} />;
}
