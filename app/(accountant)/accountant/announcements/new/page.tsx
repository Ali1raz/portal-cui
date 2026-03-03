import { AccountantCreateAnnouncementForm } from "./_components/create-announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="@container/main space-y-4 max-w-5xl w-full">
      <h1 className="text-lg font-semibold">Create New Announcement</h1>

      <AccountantCreateAnnouncementForm />
    </div>
  );
}
