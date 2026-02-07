import { adminGetOfferingAssignData } from "@/app/data/admin/get-offering-assign-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserImage } from "@/components/user/user-image";
import { AssignTeacherForm } from "./_components/assign-teacher-form";

export default async function AssignTeacherPage(
  props: PageProps<"/admin/offering/[offeringId]/assign">
) {
  const { offeringId } = await props.params;
  const { offering, professors } = await adminGetOfferingAssignData(offeringId);
  const currentAssignment = offering.teachingAssignments[0]?.professor;

  return (
    <main className="space-y-6">
      <section>
        <h1 className="text-lg font-semibold">Assign Teacher</h1>
        <p className="text-sm text-muted-foreground">
          Choose a professor for this subject offering.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Offering Details</CardTitle>
          <CardDescription>
            Review the subject and class details before assigning a teacher.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{offering.department}</Badge>
            <Badge variant="secondary">Semester {offering.semester}</Badge>
            <Badge variant="secondary">{offering.year}</Badge>
            <Badge variant="secondary">Section {offering.section}</Badge>
          </div>
          <div className="text-sm space-y-1">
            <p>
              Subject: {offering.subject.name} ({offering.subject.code})
            </p>
            <p>Credit Hours: {offering.subject.creditHours}</p>
          </div>
          {currentAssignment ? (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <UserImage
                image={currentAssignment.user.image}
                className="h-10 w-10"
              />
              <div>
                <p className="text-sm font-medium">
                  Current Teacher: {currentAssignment.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentAssignment.employeeNo} ·{" "}
                  {currentAssignment.department}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No teacher has been assigned yet.
            </p>
          )}
        </CardContent>
      </Card>

      <AssignTeacherForm offering={offering} professors={professors} />

      <Card>
        <CardHeader>
          <CardTitle>Professors & Current Subjects</CardTitle>
          <CardDescription>
            Review assigned subjects for each professor before selecting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {professors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No professors available.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {professors.map((professor) => (
                <AccordionItem key={professor.id} value={professor.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <UserImage
                        image={professor.user.image}
                        className="h-8 w-8"
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold">
                          {professor.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {professor.employeeNo} · {professor.department}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {professor.teachingAssignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No current subject assignments.
                      </p>
                    ) : (
                      professor.teachingAssignments.map((assignment) => (
                        <div
                          key={assignment.offering.id}
                          className="rounded-md border p-3 text-sm"
                        >
                          <p className="font-medium">
                            {assignment.offering.subject.name} (
                            {assignment.offering.subject.code})
                          </p>
                          <p className="text-muted-foreground">
                            {assignment.offering.department} · Semester{" "}
                            {assignment.offering.semester}·{" "}
                            {assignment.offering.year} · Section{" "}
                            {assignment.offering.section}
                          </p>
                        </div>
                      ))
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
