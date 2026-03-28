import { adminGetSemesterdetails } from "@/app/data/admin/get-semester-details";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { IconTrendingUp } from "@tabler/icons-react";
import { Suspense } from "react";
import { SemesterOptionsDropdown } from "../_components/semester-options-dropdown";
import {
  SemesterRegistrationsChartWrapper,
  SemesterRegistrationsChartWrapperSkeleton,
} from "../_components/semester-registrations-chart-wrapper";
import {
  normalizeSemesterChartDays,
  semesterChartSearchParamsCache,
} from "./semester-chart-search-params";

export default async function SemesterDetailPage(
  props: PageProps<"/admin/semester/[semesterId]">
) {
  const { semesterId } = await props.params;
  const chartSearchParams = await semesterChartSearchParamsCache.parse(
    props.searchParams
  );
  const chartDays = normalizeSemesterChartDays(chartSearchParams.chartDays);

  const { semester, totalRegistrations, totalOfferings } =
    await adminGetSemesterdetails(semesterId);

  const sessionCode = `${semester.semester}-${semester.batch}${semester.year.toString().slice(-2)}-${semester.program || ""}${semester.department}`;

  return (
    <main className="@container/main space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Semester Details</h1>
          <p className="text-muted-foreground">Session: {sessionCode}</p>
        </div>
        <SemesterOptionsDropdown semesterId={semesterId} />
      </div>

      {/* Summary Cards */}
      <section className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Batch & Program</CardDescription>
            <CardTitle className="text-lg font-semibold">
              {semester.batch} {semester.year}{" "}
              {semester.program ? `- ${semester.program}` : ""}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Department {semester.department}
            </div>
          </CardFooter>
        </Card>
        {/* Total Registrations */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Registrations</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalRegistrations}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Student registrations in this semester
              <IconTrendingUp className="size-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Total Offerings */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Offerings</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalOfferings}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Subject offerings in this semester
              <IconTrendingUp className="size-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Status */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-lg font-semibold">
              <Badge variant={semester.isActive ? "primary" : "secondary"}>
                {semester.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Current semester status
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Chart */}
      <section className="grid grid-cols-1 gap-4">
        <Suspense fallback={<SemesterRegistrationsChartWrapperSkeleton />}>
          <SemesterRegistrationsChartWrapper
            semesterId={semesterId}
            chartDays={chartDays}
          />
        </Suspense>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 @3xl/main:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Term Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 @[360px]/card:grid-cols-2 @3xl/main:grid-cols-1">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="text-base font-medium">
                {formatDate(semester.startDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="text-base font-medium">
                {formatDate(semester.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Registration Period</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 @[360px]/card:grid-cols-2 @3xl/main:grid-cols-1">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="text-base font-medium">
                {formatDate(semester.registrationStart)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="text-base font-medium">
                {formatDate(semester.registrationEnd)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card sm:col-span-2 @3xl/main:col-span-1">
          <CardHeader>
            <CardTitle>Enrollment Period</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 @[360px]/card:grid-cols-2 @3xl/main:grid-cols-1">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="text-base font-medium">
                {formatDate(semester.enrollmentStart)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="text-base font-medium">
                {formatDate(semester.enrollmentEnd)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
