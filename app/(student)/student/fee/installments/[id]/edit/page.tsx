import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

import { studentGetInstallmentSplitRequestForEdit } from "@/app/data/student/st-get-installment-split-request-for-edit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { formatEnumLabel } from "@/lib/utils";
import { EditInstallmentSplitForm } from "./_components/edit-installment-split-form";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

export default async function EditInstallmentSplitRequestPage(
  props: PageProps<"/student/fee/installments/[id]/edit">
) {
  const { id } = await props.params;
  const details = await studentGetInstallmentSplitRequestForEdit(id);

  if (!details.canEdit) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyDescription className="text-xl text-nowrap text-foreground">
            You cannot edit this request. It is already reviewed.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 my-6 px-4 md:px-6">
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href="/student/fee/installments">
            <IconArrowLeft className="size-4" />
            Back to Installments
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-semibold">Edit Installment Request</h1>
          <p className="text-sm text-muted-foreground">
            Update details and resubmit for HOD review.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">
            Request #{details.id.slice(0, 8)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Submitted on {formatDate(details.createdAt)} • Status{" "}
            {formatEnumLabel(details.status)}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <EditInstallmentSplitForm request={details} />
        </CardContent>
      </Card>
    </div>
  );
}
