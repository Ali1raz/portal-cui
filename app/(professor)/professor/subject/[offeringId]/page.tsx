import { Metadata } from "next";
import { getProfessorSubjectDetails } from "@/app/data/professor/get-section-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAsset, IconNotes, IconUser } from "@tabler/icons-react";
import Link from "next/link";

export default async function SectionPage(
  props: PageProps<"/professor/subject/[offeringId]">
) {
  const { offeringId } = await props.params;

  const { subject, pendingLeaveRequests, totalStudents, section, semester } =
    await getProfessorSubjectDetails(offeringId);

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
              <CardTitle className="text-xl space-x-2">
                <span>Subject</span>
                <span className="text-primary font-bold">
                  {subject.name} {subject.code}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-start flex-col">
              <div className="flex items-baseline flex-wrap gap-6">
                <div className="*:not-first:text-muted-foreground">
                  <p>Total Students</p>
                  <p>{totalStudents}</p>
                </div>
                <div className="*:not-first:text-muted-foreground">
                  <p>Semester</p>
                  <p>{semester}</p>
                </div>
                <div className="*:not-first:text-muted-foreground">
                  <p>Class</p>
                  <p>{section}</p>
                </div>
                <div className="*:not-first:text-muted-foreground">
                  <p>Leave requests</p>
                  <p>{pendingLeaveRequests}</p>
                </div>
              </div>
              <div className="mt-4 grid max-[460px]:grid-cols-1 grid-cols-2 lg:grid-cols-3 gap-8">
                <Link
                  href={`/professor/subject/${offeringId}/attendance`}
                  className=""
                >
                  <Card className="border-2 border-dashed group rounded border-primary/50 hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconUser className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      Mark Attendance
                    </span>
                  </Card>
                </Link>
                <Link
                  href={`/professor/subject/${offeringId}/lectures`}
                  className=""
                >
                  <Card className="border-2 border-dashed group rounded border-primary/50 hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconUser className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      View Attendances
                    </span>
                  </Card>
                </Link>
                <Link href={`/professor/subject/${offeringId}/leave-requests`}>
                  <Card className="border-2 border-dashed group rounded border-primary/50 hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconUser className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      Leave requests
                    </span>
                  </Card>
                </Link>
                <Link href={`/professor/subject/${offeringId}`} className="">
                  <Card className="border-2 group border-dashed rounded hover:border-primary transition-colors duration-200 flex flex-col items-start gap-2 p-4">
                    <IconNotes className="size-12" />
                    <span className="mt-4 group-hover:text-primary">
                      Manage Marks
                    </span>
                  </Card>
                </Link>
                <Link
                  href={`/professor/subject/${offeringId}`}
                  className="hover:underline underline-offset-4"
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

export const metadata: Metadata = {
  title: "Subject Details",
  description: "Class overview and management tools for this subject.",
};
