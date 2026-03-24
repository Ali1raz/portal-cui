import { adminGetOfferingAssignData } from "@/app/data/admin/get-offering-assign-data";
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
  const currentAssignment = offering.teachingAssignments[0];

  return (
    <main className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Assign Teacher</h1>
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
            <Badge variant="secondary">
              Semester {offering.semester?.semester}
            </Badge>
            <Badge variant="secondary">{offering.semester?.year}</Badge>
            {currentAssignment && (
              <Badge variant="secondary">
                Section {currentAssignment.section ?? "A"}
              </Badge>
            )}
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
                image={currentAssignment.professor.user.image}
                className="h-10 w-10"
              />
              <div>
                <p className="text-sm font-medium">
                  Current Teacher: {currentAssignment.professor.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentAssignment.professor.employeeNo} ·{" "}
                  {currentAssignment.professor.department}
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
    </main>
  );
}
