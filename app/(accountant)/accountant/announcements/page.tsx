import { Metadata } from "next";
import { Suspense } from "react";
import { accountantGetAnnouncements } from "@/app/data/accountant/get-announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { accountantAnnouncementsSearchParamsCache } from "./announcements-search-params";
import { AccountantAnnouncementsTable } from "./_components/announcements-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Manage, create and schedule announcements.",
};

/// Accountant announcements list page with filters and pagination.
export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedParams = accountantAnnouncementsSearchParamsCache.parse(
    await searchParams
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Announcements</h1>

            <Button asChild>
              <Link href="/accountant/announcements/new">New</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            Manage fee announcements and financial communications. Create and
            schedule announcements with flexible audience targeting.
          </p>
          <div className="my-2">
            <Suspense fallback={<AnnouncementsTableSkeleton />}>
              <AnnouncementsList params={parsedParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function AnnouncementsList({
  params,
}: {
  params: Awaited<
    ReturnType<typeof accountantAnnouncementsSearchParamsCache.parse>
  >;
}) {
  const { announcements, totalCount } =
    await accountantGetAnnouncements(params);

  return (
    <AccountantAnnouncementsTable
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
