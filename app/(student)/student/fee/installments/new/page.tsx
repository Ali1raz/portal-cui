import { studentGetFeeSplitContext } from "@/app/data/student/st-get-installment-split-options";
import { CreateInstallmentSplitForm } from "./_components/create-installment-split-form";

export default async function NewInstallmentsPage() {
  const splitContext = await studentGetFeeSplitContext();

  return (
    <div className="px-4 md:px-6 my-6 space-y-6 max-w-6xl w-full">
      <div className="my-4 space-y-1.5">
        <h1 className="text-lg font-semibold">Request Fee Split</h1>
        <p className="text-muted-foreground text-sm">
          Split request will be sent to HOD for approval.
        </p>
      </div>

      {!splitContext ? (
        <p className="text-sm text-muted-foreground">
          No published fee details are available for your profile.
        </p>
      ) : (
        <CreateInstallmentSplitForm splitContext={splitContext} />
      )}
    </div>
  );
}
