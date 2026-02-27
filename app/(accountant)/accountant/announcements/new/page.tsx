import { AccountantCreateAnnouncementForm } from "./_components/create-announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Create New Announcement</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Create fee announcements and financial communications for students.
          Target specific departments, programs, batches, or broadcast to all
          students.
        </p>
      </div>

      <div className="max-w-2xl">
        <AccountantCreateAnnouncementForm />
      </div>
    </div>
  );
}
