import { accountantGetAllSemesters } from "@/app/data/accountant/acc-get-all-semesters";
import { AccountantCreateFeeForm } from "./_components/accountant-create-fee-form";

export default async function AccountantSemesterFeePage() {
  const data = await accountantGetAllSemesters();
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <h1 className="text-3xl font-bold">Create Semester Fee</h1>

      <AccountantCreateFeeForm semesters={data} />
    </div>
  );
}
