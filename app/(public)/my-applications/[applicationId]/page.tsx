import { userGetApplicationDetails } from "@/app/data/user/user-get-application-details";
import { StudentApplicationStatusBanner } from "@/components/student-applications/student-application-status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { IconArrowLeft, IconClockHour4 } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { MY_APPLICATION_EDITABLE_STATUSES } from "../my-application-constants";

export default async function MyApplicationDetailsPage(
  props: PageProps<"/my-applications/[applicationId]">
) {
  const { applicationId } = await props.params;

  return (
    <main className="py-4 space-y-4 md:space-y-6">
      <Suspense fallback={<MyApplicationDetailsSkeleton />}>
        <MyApplicationDetailsContent applicationId={applicationId} />
      </Suspense>
    </main>
  );
}

async function MyApplicationDetailsContent({
  applicationId,
}: {
  applicationId: string;
}) {
  const details = await userGetApplicationDetails(applicationId);

  if (!details) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Application not found
          </p>
        </CardContent>
      </Card>
    );
  }

  const canEdit = MY_APPLICATION_EDITABLE_STATUSES.includes(details.status);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href="/my-applications">
            <IconArrowLeft className="size-4" />
            All Applications
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight leading-tight">
          Application Attempt #{details.attemptNo}
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <IconClockHour4 className="size-4" />
          Submitted {formatDate(details.submittedAt || details.createdAt)}
        </p>

        {canEdit ? (
          <Button asChild size="sm" className="mt-2">
            <Link href={`/my-applications/${applicationId}/edit`}>
              Edit Application
            </Link>
          </Button>
        ) : null}
      </div>

      <StudentApplicationStatusBanner status={details.status} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>{details.status}</Badge>
                <Badge>{details.preferredDepartment}</Badge>
                <Badge>Attempt #{details.attemptNo}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </p>
                  <p className="font-medium">{details.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Gender
                  </p>
                  <p className="font-medium">{details.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </p>
                  <p className="font-medium">
                    {formatDate(details.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="font-medium">{details.phoneNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    City
                  </p>
                  <p className="font-medium">{details.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Department
                  </p>
                  <p className="font-medium">{details.preferredDepartment}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="text-sm whitespace-pre-wrap mt-1">
                  {details.address}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Previous Degree
                  </p>
                  <p className="font-medium">{details.previousDegree}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Previous Institution
                  </p>
                  <p className="font-medium">{details.previousInstitution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Passing Year
                  </p>
                  <p className="font-medium">{details.previousPassingYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Percentage
                  </p>
                  <p className="font-medium">
                    {details.percentage.toString()}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(details.createdAt)}
              </p>

              <p className="text-xs font-medium ">Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(details.updatedAt)}
              </p>

              <p className="text-xs font-medium ">Submitted</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(details.submittedAt || details.createdAt)}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function MyApplicationDetailsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-52" />
      </div>

      <Skeleton className="h-24 w-full rounded-lg" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-20" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
