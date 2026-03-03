import { AdminCreateAnnoucenmentForm } from "./_components/admin-create-announcement-form";

export default function AdminNewAnnoucenmtPage() {
  return (
    <div className="@container/main space-y-4 max-w-5xl w-full">
      <h2 className="text-lg font-semibold">New Annoucement</h2>

      <AdminCreateAnnoucenmentForm />
    </div>
  );
}
