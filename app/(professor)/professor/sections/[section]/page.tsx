import { getSectionDetails } from "@/app/data/professor/get-section-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAsset, IconNotes, IconUser } from "@tabler/icons-react";
import Link from "next/link";

export default async function SectionPage(
  props: PageProps<"/professor/sections/[section]">
) {
  const section = (await props.params).section;

  const data = await getSectionDetails(section);

  if (!data) {
    return <div>You are not assigned to any sections YET.</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex items-start sm:flex-row flex-col sm:justify-between justify-start gap-4">
            <h1>
              Class Details{" "}
              <span className="text-primary font-semibold">{section}</span>!
              Here is your class overview.
            </h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                Subject:{" "}
                <span className="text-primary text-xl font-bold">
                  {data.subject.name} {data.subject.code}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-start flex-col">
              <div className="space-y-2">
                <p>Total Students: {data.totalStudents}</p>
                <p>Semester: {data.semester}</p>
              </div>
              <div className="mt-4 grid max-[460px]:grid-cols-1 grid-cols-2 lg:grid-cols-3 gap-8">
                <Link
                  href={`/professor/sections/${section}/attendance`}
                  className="no-underline"
                >
                  <Card className="border-2 border-dashed group rounded border-primary/50 hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconUser className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      Manage Attendance
                    </span>
                  </Card>
                </Link>
                <Link
                  href={`/professor/sections/${section}`}
                  className="no-underline"
                >
                  <Card className="border-2 group border-dashed rounded hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconNotes className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      Manage Marks
                    </span>
                  </Card>
                </Link>
                <Link
                  href={`/professor/sections/${section}`}
                  className="no-underline"
                >
                  <Card className="border-2 group border-dashed rounded hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconAsset className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      Manage Assignments
                    </span>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
