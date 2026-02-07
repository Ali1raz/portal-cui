import { adminGetSubjectForEdit } from "@/app/data/admin/get-subject-for-edit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateSubjectForm } from "./_components/update-subject-form";

export default async function EditSubject(
  props: PageProps<"/admin/subjects/[subjectId]/update">
) {
  const { subjectId } = await props.params;
  const subject = await adminGetSubjectForEdit(subjectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Subject</CardTitle>
        <CardDescription>
          Edit the subject details and save your changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateSubjectForm subject={subject} />
      </CardContent>
    </Card>
  );
}
