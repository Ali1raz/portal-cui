import { Metadata } from "next";
import { getStudentEnrolledSubjects } from "@/app/data/student/get-subjects-enrolled";

import Link from "next/link";
import { LeaveRequestForm } from "./_components/leave-request-form";
import { redirect } from "next/navigation";
import { requirePermission } from "@/app/data/permission/require-permission";
import { ArrowUpRightIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Request Leave",
  description: "Submit a leave request to your batch advisor for approval.",
};

export default async function LeaveRequestPage() {
  const can = await requirePermission({
    leaveRequest: ["create"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

  const { subjects, studentId } = await getStudentEnrolledSubjects();

  return (
    <div className="@container/main p-4 space-y-4 mb-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">New Leave Request</h2>
        <p className="text-sm text-muted-foreground">
          This will be sent to your Department&apos;s Batch Advisor for further
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
      </div>
      {subjects.length > 0 ? (
        <div className="mt-8">
          <LeaveRequestForm subjects={subjects} studentId={studentId} />
        </div>
      ) : (
        <div className="mt-8">
          <p>You are not enrolled in any subjects.</p>
        </div>
      )}
    </div>
  );
}
