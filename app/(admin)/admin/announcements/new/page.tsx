import { AdminCreateAnnoucenmentForm } from "./_components/admin-create-announcement-form";

export default function AdminNewAnnoucenmtPage() {
  return (
    <div className="@container/main space-y-4">
      <h2 className="text-2xl font-bold">Create new Annoucement</h2>

      <AdminCreateAnnoucenmentForm />
    </div>
  );
}
