import { getStudentRegistrationDetails } from "@/app/data/student/get-student-registration-details";
import { formatDate } from "@/lib/utils";
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
  const latestRegistration = data?.registration[0];

  if (!data) {
    return (
      <div className="@container/main p-4 space-y-4">
        <h2 className="text-2xl font-bold">Registration Details</h2>
        <p className="text-sm text-muted-foreground">
          No registration details found.
        </p>
      </div>
    );
  }

  return (
    <div className="@container/main p-4 space-y-4">
      <h2 className="text-2xl font-bold">Registration Details</h2>
      <p className="text-muted-foreground">
        Hi{" "}
        <span className="text-primary underline-offset-4">
          {data.user.name}
        </span>
        , here is your current registration information:
      </p>

      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4">
            <span>Registration Nr:</span>
            <span className="font-semibold text-xl">{data.registrationNo}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Email:</span>
            <span className="font-medium">{data.user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Program:</span>
            <span className="font-medium">{data.program}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Department:</span>
            <span className="font-medium">{data.department}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Batch:</span>
            <span className="font-medium">
              {data.registration.map((reg) => reg.semester?.batch).join(", ") ||
                "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Semester:</span>
            <span className="font-medium">
              {latestRegistration?.semester
                ? `${latestRegistration.semester.semester} (${latestRegistration.semester.year})`
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Registered At:</span>
            <span className="font-medium">
              {latestRegistration?.createdAt
                ? formatDate(latestRegistration.createdAt)
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Enrollments Table */}
        {data.enrollments.length ? (
          <div className="overflow-auto">
            <h3 className="font-semibold mb-2 mt-6">
              Enrolled Subjects <span>({data.enrollments.length})</span>
            </h3>
            <Table className="min-w-full border text-sm">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Sr Nr.</TableHead>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Credit Hours</TableHead>
                  <TableHead>Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.enrollments.map((enr, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{enr.offering.subject.code}</TableCell>
                    <TableCell>{enr.offering.subject.name}</TableCell>
                    <TableCell>{enr.offering.subject.creditHours}</TableCell>
                    <TableCell>{enr.teacherName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div>No active enrollments found.</div>
        )}
      </div>
    </div>
  );
}
