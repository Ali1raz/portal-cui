import Link from "next/link";
import { ProfessorSections } from "@/app/data/professor/get-professor-sections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionCard({
  assignment,
}: {
  assignment: ProfessorSections["assignments"][number];
}) {
  return (
    <Card className="group">
      <CardHeader>
        <CardTitle>
          <Link href={`/professor/sections/${assignment.offering.section}`}>
            <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:underline group-hover:text-primary">
              {assignment.offering.subject.code} -{" "}
              {assignment.offering.subject.name}
            </h2>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          key={assignment.id}
          href={`/professor/sections/${assignment.offering.section}`}
        >
          <div className="">
            <p>Section: {assignment.offering.section}</p>
            <p>Semester: {assignment.offering.semester}</p>
            <p>Credit Hours: {assignment.offering.subject.creditHours}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export function SectionCardSkeleton() {
  return (
    <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="space-y-2">
          <CardHeader>
            <Skeleton className="h-8 w-full rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-6 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
