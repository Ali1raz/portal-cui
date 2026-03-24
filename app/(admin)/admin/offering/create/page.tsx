import { adminGetOfferingFormData } from "@/app/data/admin/get-offering-form-data";
import { AdminCreateOfferingForm } from "./_components/create-offering-form";

export default async function CreateOfferingOffer() {
  const { subjects, semesters } = await adminGetOfferingFormData();

  return (
    <div className="w-full max-w-5xl">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold">Create Offering</h1>
      </div>
      <AdminCreateOfferingForm subjects={subjects} semesters={semesters} />
    </div>
  );
}
