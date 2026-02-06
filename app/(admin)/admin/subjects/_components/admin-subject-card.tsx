import { AdminGetAllSubjectsType } from "@/app/data/admin/get-all-subjects";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AdminsubjectOptionsDropdown } from "./admin-subject-options-dropdown";

interface iAppProps {
  subject: AdminGetAllSubjectsType;
}

export function AdminSubjectCard({ subject }: iAppProps) {
  /// Total enrollments across all offerings
  const totalEnrollments = subject.offerings.reduce(
    (total, offering) => total + offering._count.enrollments,
    0
  );

  return (
    <Card className="h-full hover:shadow-md group transition-shadow">
      <CardHeader className="">
        <CardTitle className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 leading-tight group-hover:text-primary group-hover:underline transition-colors duration-200">
            <Link href={`/admin/subjects/${subject.id}`}>{subject.name}</Link>
          </h2>
          <Badge variant="secondary">{subject.code}</Badge>
        </CardTitle>

        {/* <Badge variant={subject.isDeleted ? "destructive" : "default"}>
        {subject.isDeleted ? "Deleted" : "Active"}
      </Badge> */}
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-medium">
            {subject.creditHours} Credit hour
            {subject.creditHours === 1 ? "" : "s"}
          </div>
          <span className="text-sm">{totalEnrollments} Enrollments</span>
        </div>
        <div className="flex items-center justify-between mt-4 gap-2">
          <Link
            href={`/admin/subjects/${subject.id}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "text-sm w-full ",
            })}
          >
            See Details
          </Link>
          <AdminsubjectOptionsDropdown subjectId={subject.id} />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminSubjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2 mb-4">
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-10 h-6" />
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="flex-2 h-6" />
          <Skeleton className="flex-1 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
