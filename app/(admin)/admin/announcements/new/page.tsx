import { Metadata } from "next";
import { AdminCreateAnnoucenmentForm } from "./_components/admin-create-announcement-form";

export const metadata: Metadata = {
  title: "New Announcement",
  description: "Create and publish a new announcement for the platform.",
};

export default function AdminNewAnnoucenmtPage() {
  return (
    <div className="@container/main space-y-4 max-w-5xl w-full">
      <h2 className="text-lg font-semibold">New Annoucement</h2>

      <AdminCreateAnnoucenmentForm />
    </div>
  );
}
