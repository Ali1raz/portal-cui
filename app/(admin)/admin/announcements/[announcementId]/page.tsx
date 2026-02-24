import { adminGetAnnouncementForUpdate } from "@/app/data/admin/get-announcement-for-update";
import { UpdateAnnouncementForm } from "./_components/update-announcement-form";

export default async function AdminUpdateAnnouncementPage(
  props: PageProps<"/admin/announcements/[announcementId]">
) {
  const { announcementId } = await props.params;
  const announcement = await adminGetAnnouncementForUpdate(announcementId);

  return (
    <div className="px-4 md:px-6 my-6 max-w-5xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">Edit Announcement</h1>
        <p className="text-muted-foreground text-sm">
          Update announcement details, targeting, and republish or reschedule.
        </p>
      </div>
      <UpdateAnnouncementForm announcement={announcement} />
    </div>
  );
}
