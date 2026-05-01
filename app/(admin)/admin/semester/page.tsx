import { Metadata } from "next";
import { adminGetSemesters } from "@/app/data/admin/get-semesters";
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
import Link from "next/link";
import { Suspense } from "react";
import {
  semesterSearchParamsCache,
  type SemesterSearchParams,
} from "./semester-search-params";
import { SemestersTable } from "./_components/semesters-table";

export const metadata: Metadata = {
  title: "Semesters",
  description:
    "Manage semesters, registration windows, and enrollment schedules.",
};

export default async function SemesterPage(
  props: PageProps<"/admin/semester">
) {
  return (
    <div className="@container/main space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Semesters</h1>
        <Link href="/admin/semester/create" className={buttonVariants()}>
          Create Semester
        </Link>
      </div>

      <Suspense fallback={<SemestersTableSkeleton />}>
        <SemesterList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function SemesterList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/semester">["searchParams"];
}) {
  const parsedParams: SemesterSearchParams =
    await semesterSearchParamsCache.parse(searchParams);
  const { semesters, totalCount } = await adminGetSemesters(parsedParams);

  return <SemestersTable semesters={semesters} totalCount={totalCount} />;
}

function SemestersTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 10 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 10 }).map((_, cellIndex) => (
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
