import { getStudentEnrolledSubjects } from "@/app/data/student/get-subjects-enrolled";

import Link from "next/link";
import { LeaveRequestForm } from "./_components/leave-request-form";
import { redirect } from "next/navigation";
import { requirePermission } from "@/app/data/permission/require-permission";
import { ArrowUpRightIcon } from "lucide-react";

export default async function LeaveRequestPage() {
  const can = await requirePermission({
    leaveRequest: ["create"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

  const { subjects, studentId } = await getStudentEnrolledSubjects();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="p-6">
          <h1 className="font-bold text-xl">New Leave Request</h1>
          <p className="my-3  text-sm text-muted-foreground max-w-2xl">
            This will be sent to your respective Head of Department for further
            review, so make sure to provide valid reasons to support your leave
            application.
          </p>
          <Link
            className="text-primary hover:underline group underline-offset-4 flex items-center gap-1 w-max"
            href="/student/past-leave-requests"
          >
            <span>View all leave Requests</span>
            <ArrowUpRightIcon className="size-4 origin-left group-hover:scale-125 transition duration-100" />
          </Link>
          <div>
            <LeaveRequestForm subjects={subjects} studentId={studentId} />
          </div>
        </div>
      </div>
    </div>
  );
}
