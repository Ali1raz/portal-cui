import { Metadata } from "next";
import { userGetApplications } from "@/app/data/user/user-get-applications";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Applications",
  description:
    "View the status, history, and details of your submitted applications.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MyApplicationsPage() {
  return (
    <main>
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
      </div>
      <Suspense fallback={<MyApplicationsListSkeleton />}>
        <MyApplicationsList />
      </Suspense>
    </main>
  );
}

async function MyApplicationsList() {
  const applications = await userGetApplications();

  if (applications.length === 0) {
    return (
      <div className="w-full min-h-72 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">
          You don&apos;t have submitted any application
        </h1>
        <p className="text-muted-foreground max-w-xl text-center">
          You don&apos;t have submitted any application.
        </p>

        <a
          href="/apply"
          className={buttonVariants({ size: "sm", className: "mt-4" })}
        >
          Apply
        </a>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      {applications.map((app) => (
        <Link key={app.id} href={`/my-applications/${app.id}`}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <h1>Department {app.preferredDepartment}</h1>
                <Badge>{app.status}</Badge>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground ">
                  Submitted at: {formatDate(app.submittedAt || app.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Updated: {formatDate(app.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function MyApplicationsListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
