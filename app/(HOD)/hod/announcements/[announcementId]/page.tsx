import { UpdateAnnouncementForm } from "./_components/update-announcement-form";
import { hodGetAnnouncementForUpdate } from "@/app/data/hod/hodGetAnnouncementForUpdate";

/// HOD announcement edit page.
export default async function UpdateAnnouncementPage(
  props: PageProps<"/hod/announcements/[announcementId]">
) {
  const { announcementId } = await props.params;
  const announcement = await hodGetAnnouncementForUpdate(announcementId);

  return (
    <div className="px-4 md:px-6 my-6 max-w-5xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">Edit Announcement</h1>
        <p className="text-muted-foreground text-sm">
          Update announcement details and republish or reschedule.
        </p>
      </div>
      <UpdateAnnouncementForm announcement={announcement} />
    </div>
  );
}
