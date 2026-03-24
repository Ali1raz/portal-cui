import { adminGetSemesters } from "@/app/data/admin/get-semesters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function SemesterPage() {
  const { semesters } = await adminGetSemesters();

  return (
    <div className="@container/main space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Semesters</h1>
        <Link
          href="/admin/semester/create"
          className={buttonVariants({ size: "sm" })}
        >
          Create New Semester
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Semester</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Term Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Enrollment</TableHead>
              <TableHead>Offerings</TableHead>
              <TableHead>Registrations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground"
                >
                  No semesters found.
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((semesterItem) => (
                <TableRow key={semesterItem.id}>
                  <TableCell>{semesterItem.semester}</TableCell>
                  <TableCell>{semesterItem.year}</TableCell>
                  <TableCell>{semesterItem.department}</TableCell>
                  <TableCell>{semesterItem.batch}</TableCell>
                  <TableCell>
                    {formatDate(semesterItem.startDate)} -{" "}
                    {formatDate(semesterItem.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={semesterItem.isActive ? "primary" : "secondary"}
                    >
                      {semesterItem.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(semesterItem.registrationStart)} -{" "}
                    {formatDate(semesterItem.registrationEnd)}
                  </TableCell>
                  <TableCell>
                    {formatDate(semesterItem.enrollmentStart)} -{" "}
                    {formatDate(semesterItem.enrollmentEnd)}
                  </TableCell>
                  <TableCell>{semesterItem._count.subjectOfferings}</TableCell>
                  <TableCell>{semesterItem._count.registrations}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
