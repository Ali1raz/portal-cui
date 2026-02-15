import { studentsGetComplaints } from "@/app/data/student/get-complaints";
import { Button } from "@/components/ui/button";
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
    <div className="px-4 md:px-6 my-6">
      <div className="flex items-center justify-between">
        <h1>Complaints</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/complaints/new">New Complaint</Link>
        </Button>
      </div>
      <div className="mt-4">
        <Suspense fallback={<ComplaintsTableSkeleton />}>
          <ComplaintsList searchParams={props.searchParams} />
        </Suspense>
      </div>
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
