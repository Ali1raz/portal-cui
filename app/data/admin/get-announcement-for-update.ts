import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import "server-only";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";

/// Fetch announcement data for admin update form.
export async function adminGetAnnouncementForUpdate(announcementId: string) {
  const can = await requirePermission({
    announcements: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const session = await requireSession();

  const ann = await prisma.announcement.findUnique({
    where: { id: announcementId, authorId: session.user.id },
    select: {
      id: true,
      title: true,
      content: true,
      imageKey: true,
      isPinned: true,
      status: true,
      scheduledFor: true,
      type: true,
      targetDepartment: true,
      targetProgram: true,
      targetBatch: true,
    },
  });

  if (!ann) {
    return notFound();
  }

  return ann;
}

export type AdminGetAnnouncementForUpdateType = Awaited<
  ReturnType<typeof adminGetAnnouncementForUpdate>
>;
