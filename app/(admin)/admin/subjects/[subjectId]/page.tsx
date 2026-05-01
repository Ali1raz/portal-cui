import { Metadata } from "next";
import { getSubjectDetails } from "@/app/data/admin/get-subject-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { UserImage } from "@/components/user/user-image";

export const metadata: Metadata = {
  title: "Subject Details",
  description: "Review subject details.",
};

export default async function SubjectPAge(
  props: PageProps<"/admin/subjects/[subjectId]">
) {
  const subjectID = (await props.params).subjectId;
  const { subject, assignemnts } = await getSubjectDetails(subjectID);

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Subject Details</h1>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-medium">{subject.name}</h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Subject Code:</span>{" "}
              {subject.code}
            </p>
            <p>
              <span className="font-semibold">Credit Hours:</span>{" "}
              {subject.creditHours}
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium">Offerings</h2>
            <CardDescription>
              This subject is offered in the following departments and
              semesters. Click on each offering to see more details.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {subject.offerings.length === 0 ? (
              <p>No offerings available for this subject.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {subject.offerings.map((offering) => (
                  <AccordionItem key={offering.id} value={offering.department}>
                    <AccordionTrigger>
                      <h1 className="text-lg font-semibold">
                        Department: {offering.department} -{" "}
                        {offering.semester?.semester}{" "}
                        <span>{offering.semester?.year}</span>
                      </h1>
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 justify-baseline gap-5">
                      <div className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                        <p>Semester </p>
                        <p>{offering.semester?.semester}</p>
                      </div>
                      <div className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                        <p>Total Enrollments</p>
                        <p>{offering._count.enrollments}</p>
                      </div>
                      <div>Year: {offering.semester?.year}</div>
                      <div className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                        <p>Total Lectures</p> <p>{offering.totalLectures}</p>
                      </div>
                      <div className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                        <p>Department</p>
                        <p>{offering.department}</p>
                      </div>
                      {offering.teachingAssignments.length === 0 ? (
                        <Link
                          href={`/admin/offering/${offering.id}/assign`}
                          className="underline"
                        >
                          Assign teacher to this offering
                        </Link>
                      ) : (
                        <div>
                          {offering.teachingAssignments.map(
                            ({ professor, section }, i) => (
                              <div key={i}>
                                <div className="group *:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                                  <p>Teacher Assigned</p>
                                  <p>
                                    <Link
                                      href={`/admin/users/${professor.user.id}`}
                                      className="flex items-center gap-2 group-hover:text-primary hover:text-primary hover:underline underline-offset-2"
                                    >
                                      {professor.user.name}
                                      <ArrowUpRight className="size-4" />
                                    </Link>
                                  </p>
                                  <p>{professor.employeeNo}</p>
                                </div>
                                <div className="*:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                                  <p>Class</p>
                                  <p>{section ?? "A"}</p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {/* {offering.teachingAssignments[0]?.professor ? (
                        <div>
                          Professor:{" "}
                          {offering.teachingAssignments[0].professor.user.name}
                        </div>
                      ) : (
                        
                      )} */}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium">Assignments</h2>
            <CardDescription>
              This subject is assigned to the following professors. Click on
              each professor to see more details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignemnts.length === 0 ? (
              <p>No assignments available for this subject.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {assignemnts.map((assignment) => (
                  <AccordionItem key={assignment.id} value={assignment.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4">
                        <UserImage
                          className="size-12"
                          image={assignment.professor.user.image}
                        />
                        <h1 className="text-lg font-semibold">
                          {assignment.professor.user.name}
                        </h1>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div className="group *:not-first:text-muted-foreground *:not-first:text-sm *:not-first:my-2">
                        <p>Professor Details</p>
                        <Link
                          href={`/admin/users/${assignment.professor.user.id}`}
                          className="hover:underline underline-offset-4 hover:text-primary group-hover:text-primary"
                        >
                          {assignment.professor.user.name}
                        </Link>
                        <p>{assignment.professor.employeeNo}</p>
                        <p>Department: {assignment.professor.department}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
