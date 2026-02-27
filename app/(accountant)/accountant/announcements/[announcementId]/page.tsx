import { accountantGetAnnouncementForUpdate } from "@/app/data/accountant/get-announcement-for-update";
import { UpdateAnnouncementForm } from "./_components/update-announcement-form";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

/// Page for editing existing fee announcements.
export default async function EditAnnouncementPage(props: PageProps) {
  const { announcementId } = await props.params;
  const announcement = await accountantGetAnnouncementForUpdate(announcementId);

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Edit Announcement</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Update announcement details, targeting, and scheduling options.
        </p>
      </div>

      <div className="max-w-2xl">
        <UpdateAnnouncementForm announcement={announcement} />
      </div>
    </div>
  );
}
