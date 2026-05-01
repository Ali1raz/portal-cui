import { accountantGetFeeForEditInstallments } from "@/app/data/accountant/get-fee-for-edit-installments";
import { EditInstallmentsForm } from "./_components/edit-installments-form";

export default async function FeeEditPage(
  props: PageProps<"/accountant/manage-fee/[feeId]/edit">
) {
  const { feeId } = await props.params;
  const fee = await accountantGetFeeForEditInstallments(feeId);

  const semesterLabel = `${fee.semester.batch}${fee.semester.year
    .toString()
    .slice(-2)} - ${fee.semester.program}${fee.semester.department}`;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Edit Installments</h1>
        <p className="text-sm text-muted-foreground">
          Configure installment split for Sem {fee.semester.semester} (
          {semesterLabel}).
        </p>
      </div>

      <EditInstallmentsForm fee={fee} />
    </div>
  );
}
