import { adminGetOfferingFormData } from "@/app/data/admin/get-offering-form-data";
import { AdminCreateOfferingForm } from "./_components/create-offering-form";

export default async function CreateOfferingOffer() {
  const { subjects } = await adminGetOfferingFormData();

  return (
    <div className="w-full max-w-4xl">
      <AdminCreateOfferingForm subjects={subjects} />
    </div>
  );
}
