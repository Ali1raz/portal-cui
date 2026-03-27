import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { getClerkApplicationDetails } from "@/app/data/clerk/get-clerk-application-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ClerkApplicationUpdateStatusForm } from "./_components/clerk-application-update-status-form";
import { CLERK_APPLICATION_REVIEWABLE_STATUSES } from "@/lib/data/utils";

export default async function ClerkUpdateApplicationStatusPage(
  props: PageProps<"/clerk/applications/[applicationId]/update-status">
) {
  const { applicationId } = await props.params;
  const details = await getClerkApplicationDetails(applicationId);

  const canReview = CLERK_APPLICATION_REVIEWABLE_STATUSES.includes(
    details.status
  );

  if (!canReview) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        This application has already been reviewed and cannot be updated.
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
          <Link href={`/clerk/applications/${applicationId}`}>
            <IconArrowLeft className="size-4" />
            Back to Details
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-semibold">Update Application Status</h1>
          <p className="text-sm text-muted-foreground">
            Accept application, request more information, or reject with
            remarks.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{details.fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Applied for {details.preferredDepartment} on{" "}
            {formatDate(details.submittedAt || details.createdAt)}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <ClerkApplicationUpdateStatusForm applicationId={applicationId} />
        </CardContent>
      </Card>
    </div>
  );
}
