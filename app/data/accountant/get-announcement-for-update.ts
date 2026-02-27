import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { requireSession } from "../session/require-session";
import { redirect } from "next/navigation";

/// Fetch a single announcement for accountant to update.
export async function accountantGetAnnouncementForUpdate(id: string) {
  const session = await requireSession();

  const can = await requirePermission({
    announcements: ["get", "update"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const announcement = await prisma.announcement.findFirst({
    where: {
      id,
      authorId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      status: true,
      scheduledFor: true,
      imageKey: true,
      isPinned: true,
      targetDepartment: true,
      targetProgram: true,
      targetBatch: true,
      targetYear: true,
    },
  });

  if (!announcement) {
    return redirect("/accountant/announcements");
  }

  return announcement;
}

export type AccountantGetAnnouncementForUpdateType = Awaited<
  ReturnType<typeof accountantGetAnnouncementForUpdate>
>;
