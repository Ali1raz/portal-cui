import { StudentGetSubjectsToEnrollType } from "@/app/data/student/get-subject-to-enroll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrollDropCourseButtons } from "./enroll-drop-course-buttons";

interface iAppProps {
  data: StudentGetSubjectsToEnrollType[];
}

export function SubjectsToEnrollTable({ data }: iAppProps) {
  if (data.length === 0) {
    return <div>No subjects are available to enroll yet.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Enroll Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((offering) => (
          <TableRow key={offering.id}>
            <TableCell>
              {offering.subject.name} ({offering.subject.code})
            </TableCell>
            <TableCell>{offering.teacherDisplay}</TableCell>
            <TableCell>{offering.department}</TableCell>
            <TableCell>{offering.enrollStatus}</TableCell>
            <TableCell>
              <EnrollDropCourseButtons
                offeringId={offering.id}
                enrollStatus={offering.enrollStatus}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
