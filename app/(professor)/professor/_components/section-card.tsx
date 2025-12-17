import Link from "next/link";
import { Route } from "next";
import { ProfessorSections } from "@/app/data/professor/get-professor-sections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCard({
  assignment,
}: {
  assignment: ProfessorSections["assignments"][number];
}) {
  return (
    <Card className="group">
      <CardHeader>
        <CardTitle>
          <Link
            href={`/professor/section/${assignment.offering.section}` as Route}
          >
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
          href={`/professor/section/${assignment.offering.section}` as Route}
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
