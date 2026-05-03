import { Metadata } from "next";
import { adminGetAllSubjects } from "@/app/data/admin/get-all-subjects";
import { AdminSubjectsTable } from "./_components/admin-subjects-table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubjectsSearchParams } from "@/app/(admin)/admin/subjects/subjects-search-params";
import { subjectsSearchParamsCache } from "@/app/(admin)/admin/subjects/subjects-search-params";

export const metadata: Metadata = {
  title: "Subjects",
  description:
    "Manage subjects, codes, credit hours, and their offering relationships.",
};

export default async function SubjectsPage(
  props: PageProps<"/admin/subjects">
) {
  return (
    <div className="@container/main">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">All Subjects</h1>
        <Link href={"/admin/subjects/create"} className={buttonVariants()}>
          Create subject
        </Link>
      </div>
      <Suspense fallback={<SubjectsTableSkeleton />}>
        <SubjectsList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function SubjectsList({
  searchParams,
}: {
  searchParams: PageProps<"/admin/subjects">["searchParams"];
}) {
  const parsedParams: SubjectsSearchParams =
    await subjectsSearchParamsCache.parse(searchParams);
  const { subjects, totalCount } = await adminGetAllSubjects(parsedParams);

  return <AdminSubjectsTable subjects={subjects} totalCount={totalCount} />;
}

function SubjectsTableSkeleton() {
  return (
    <div className="my-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: 6 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: 6 }).map((_, cellIndex) => (
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
