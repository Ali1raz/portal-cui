import { getStudentEnrolledSubjects } from "@/app/data/student/get-subjects-enrolled";
import { requireStudentSession } from "@/app/data/student/require-student-session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { LeaveRequestForm } from "./_components/leave-request-form";

export default async function LeaveRequestPage() {
  const session = await requireStudentSession();

  const { subjects, studentId } = await getStudentEnrolledSubjects();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h1 className="font-medium text-base">
                  Hey{" "}
                  <span className="text-primary font-bold">
                    {session.user.name}
                  </span>
                  , Fill the following fields to request for leave.
                </h1>
              </CardTitle>
              <CardDescription className="my-4 max-w-2xl">
                This will be sent to your respective Head of Department for
                further review, so make sure to provide valid reasons to support
                your leave application.
                <div>
                  <Link
                    className="text-primary visited:underline my-4"
                    href="/student/past-leave-requests"
                  >
                    View Past Leave Requests
                  </Link>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveRequestForm subjects={subjects} studentId={studentId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
