import { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { userGetApplicationDetails } from "@/app/data/user/user-get-application-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { EditMyApplicationForm } from "./_components/edit-my-application-form";
import { MY_APPLICATION_EDITABLE_STATUSES } from "../../my-application-constants";

export const metadata: Metadata = {
  title: "Edit Application",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditMyApplicationPage(
  props: PageProps<"/my-applications/[applicationId]/edit">
) {
  const { applicationId } = await props.params;
  const details = await userGetApplicationDetails(applicationId);

  if (!details) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        Application not found.
      </div>
    );
  }

  const canEdit = MY_APPLICATION_EDITABLE_STATUSES.includes(details.status);

  if (!canEdit) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        This application has already been finalized and cannot be edited.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 my-6">
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href={`/my-applications/${applicationId}`}>
            <IconArrowLeft className="size-4" />
            Back to Details
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-semibold">Edit Application</h1>
          <p className="text-sm text-muted-foreground">
            Update your information and resubmit for review.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <p className="text-sm text-muted-foreground">
            Applied for {details.preferredDepartment} on{" "}
            {formatDate(details.submittedAt || details.createdAt)}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <EditMyApplicationForm application={details} />
        </CardContent>
      </Card>
    </div>
  );
}
