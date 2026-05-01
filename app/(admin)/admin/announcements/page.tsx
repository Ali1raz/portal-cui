import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGetAllAnnouncements } from "@/app/data/admin/get-all-announcemnets";
import { adminAnnouncementsSearchParamsCache } from "./announcement-search-params";
import { AdminAnnouncementsTable } from "./_components/announcements-table";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Manage announcements across the platform.",
};

/// Wrapper component that fetches announcements data.
async function AnnouncementsTableWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await adminAnnouncementsSearchParamsCache.parse(searchParams);

  const { announcements, totalCount } = await adminGetAllAnnouncements(params);

  return (
    <AdminAnnouncementsTable
      announcements={announcements}
      totalCount={totalCount}
    />
  );
}

/// Loading skeleton for announcements table.
function AnnouncementsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
        <Skeleton className="h-10 w-40" />
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
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
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

export default async function AdminAnnouncementPage(
  props: PageProps<"/admin/announcements">
) {
  const { searchParams } = await props;
  return (
    <div className="@container/main space-y-4">
      <div className="flex sm:items-center flex-col sm:flex-row items-start gap-4 sm:justify-between">
        <h2 className="text-2xl font-bold">Manage Announcements</h2>
        <Button asChild>
          <Link href="/admin/announcements/new">Create Announcement</Link>
        </Button>
      </div>

      <Suspense fallback={<AnnouncementsTableSkeleton />}>
        <AnnouncementsTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
