import { getStudentRegistrationDetails } from "@/app/data/student/get-student-registration-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RegistrationPage() {
  const data = await getStudentRegistrationDetails();

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>
            Your current registration information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="space-y-4">
              <div>
                Hi{" "}
                <span className="font-semibold text-primary text-xl">
                  {data?.user.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Registration Nr:</span>
                <span className="font-semibold text-xl">
                  {data?.registrationNo}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Courses:</span>
                <span className="font-semibold text-xl">
                  {data?.enrollments.length}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span>Program:</span>
                <span className="font-semibold text-xl">{data?.program}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Department:</span>
                <span className="font-semibold text-xl">
                  {data?.department}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Batch:</span>
                <span className="font-semibold text-xl">
                  {data?.registration?.batch}
                </span>
              </div>
            </div>
          </section>

          {/* Enrollments Table */}
          {data?.enrollments?.length ? (
            <div className="overflow-auto">
              <h3 className="font-semibold mb-2 mt-6">Enrolled Subjects</h3>
              <Table className="min-w-full border text-sm">
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Sr Nr.</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead>Teacher Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.enrollments.map((enr, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{enr.offering.subject.code}</TableCell>
                      <TableCell>{enr.offering.subject.name}</TableCell>
                      <TableCell>{enr.offering.subject.creditHours}</TableCell>
                      <TableCell>
                        {
                          enr.offering.teachingAssignments[0]?.professor.user
                            .name
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div>No enrollments found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
