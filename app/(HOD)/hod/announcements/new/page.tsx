import { CreateAnnouncementForm } from "./_components/create-announcement-form";

/// HOD announcement creation page.
export default function HodAnnouncementCreatePage() {
  return (
    <div className="px-4 md:px-6 my-6 max-w-5xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">New Announcement</h1>
        <p className="text-muted-foreground text-sm">
          Draft a new announcement for your department. You can schedule it
          before publishing.
        </p>
      </div>
      <CreateAnnouncementForm />
    </div>
  );
}
