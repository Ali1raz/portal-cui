import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ProfessorSubjects } from "@/app/data/professor/get-professor-courses";

export function CourseCard({
  assignment,
}: {
  assignment: ProfessorSubjects["assignments"][number];
}) {
  return (
    <Card className="group">
      <CardHeader>
        <CardTitle>
          <Link
            href={`/professor/subject/${assignment.offering.id}`}
            className="no-underline"
          >
            <h2 className="text-lg font-semibold line-clamp-2 hover:underline underline-offset-4 group-hover:text-primary">
              {assignment.offering.subject.name}
            </h2>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 **:text-sm **:text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 *:not-first:text-accent-foreground *:not-first:font-bold">
              <h2>Code</h2>
              <span>{assignment.offering.subject.code}</span>
            </div>
            <div className="flex items-center gap-2 *:not-first:text-accent-foreground *:not-first:font-bold">
              <h2>Credit hrs</h2>
              <span>{assignment.offering.subject.creditHours}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 *:not-first:text-accent-foreground *:not-first:font-bold">
              <h2>Class</h2>
              <span>{assignment.section}</span>
            </div>
            <div className="flex items-center gap-2 *:not-first:text-accent-foreground *:not-first:font-bold">
              <h2>Semester</h2>
              <span>{assignment.offering.semester}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 *:not-first:text-accent-foreground *:not-first:font-bold">
              <h2>Students</h2>
              <span>{assignment.offering._count.enrollments}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href={`/professor/subject/${assignment.offering.id}`}
            className={buttonVariants({
              variant: "outline",
              className: "flex items-center gap-3 w-full",
            })}
          >
            Mark Attendnce <ArrowRight />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionCardSkeleton() {
  return (
    <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-8 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-1 items-center justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-18" />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-18" />
            </div>
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
