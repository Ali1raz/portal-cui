import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireHodSession } from "@/app/data/hod/require-hod-session";
import { requirePermission } from "@/app/data/permission/require-permission";
import { UpdateAnnouncementForm } from "./_components/update-announcement-form";

/// HOD announcement edit page.
export default async function UpdateAnnouncementPage({
  params,
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const { announcementId } = await params;
  const session = await requireHodSession();

  const can = await requirePermission({
    announcements: ["update"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const hod = await prisma.hod.findUnique({
    where: { userId: session.user.id },
    select: { department: true },
  });

  if (!hod) {
    return redirect("/unauthorized");
  }

  const announcement = await prisma.announcement.findFirst({
    where: {
      id: announcementId,
      targetDepartment: hod.department,
      authorId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      scheduledFor: true,
      isPinned: true,
      imageKey: true,
      status: true,
    },
  });

  if (!announcement) {
    return notFound();
  }

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
