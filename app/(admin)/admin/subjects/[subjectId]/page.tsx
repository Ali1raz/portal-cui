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
                        Department: {offering.department} - {offering.semester}{" "}
                        <span>{offering.year}</span>
                      </h1>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div>Semester: {offering.semester}</div>
                      <div>
                        Total Enrollments: {offering._count.enrollments}
                      </div>
                      <div>Year: {offering.year}</div>
                      <div>Total Lectures: {offering.totalLectures}</div>
                      <div>Department: {offering.department}</div>
                      <div>Section: {offering.section}</div>
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
                  <AccordionItem
                    key={assignment.id}
                    value={assignment.professor.id}
                  >
                    <AccordionTrigger>
                      <h1 className="text-lg font-semibold">
                        Professor: {assignment.professor.user.name}
                      </h1>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div>
                        Professor Name: {assignment.professor.user.name}
                      </div>
                      <div>Employee No: {assignment.professor.employeeNo}</div>
                      <div>Email: {assignment.professor.user.email}</div>
                      <div>Department: {assignment.professor.department}</div>
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
