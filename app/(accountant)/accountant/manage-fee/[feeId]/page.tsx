import Link from "next/link";
import { accountantGetFeeDetails } from "@/app/data/accountant/get-fee-details";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function FeeDetailPage(
  props: PageProps<"/accountant/manage-fee/[feeId]">
) {
  const { feeId } = await props.params;
  const fee = await accountantGetFeeDetails(feeId);

  const semesterLabel = `${fee.semester.batch}${fee.semester.year
    .toString()
    .slice(-2)} - ${fee.semester.program}${fee.semester.department}`;

  return (
    <main className="@container/main space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Fee Details</h1>
          <p className="text-muted-foreground text-sm">
            Semester {fee.semester.semester} ({semesterLabel})
          </p>
        </div>

        <Button asChild>
          <Link href={`/accountant/manage-fee/${fee.id}/edit`}>
            Edit Installments
          </Link>
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Fee</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              Rs. {fee.totalAmount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Configured semester fee amount
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle>
              <Badge variant={fee.status === "DRAFT" ? "outline" : "secondary"}>
                {fee.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Current publishing status
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Installments</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {fee.feeInstallments.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Created installments for this fee
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Created</CardDescription>
            <CardTitle className="text-base font-semibold">
              {formatDate(fee.createdAt)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Updated on {formatDate(fee.updatedAt)}
          </CardFooter>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {fee.description?.trim() || "No description provided."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Installment Breakdown</CardTitle>
          <CardAction>
            <Link
              href={`/accountant/manage-fee/${fee.id}/edit`}
              className={buttonVariants({ size: "sm" })}
            >
              Edit Installments
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {fee.feeInstallments.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No installments created yet. Use Edit Installments to configure
              them.
            </div>
          ) : (
            fee.feeInstallments.map((installment) => (
              <div
                key={installment.id}
                className="rounded-md border p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    Installment {installment.installmentNo}
                  </p>
                  <p className="font-semibold tabular-nums">
                    Rs. {installment.amount.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Due: {formatDate(installment.dueDate)}
                </p>
                {installment.description?.trim() ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {installment.description}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
