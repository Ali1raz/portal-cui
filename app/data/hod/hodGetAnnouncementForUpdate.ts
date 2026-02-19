import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import "server-only";
import { requirePermission } from "../permission/require-permission";

export async function hodGetAnnouncementForUpdate(announcementId: string) {
  const can = await requirePermission({
    announcements: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const ann = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: {
      id: true,
      title: true,
      content: true,
      imageKey: true,
      isPinned: true,
      status: true,
      scheduledFor: true,
      type: true,
    },
  });

  if (!ann) {
    return notFound();
  }

  return ann;
}

export type HodGetAnnouncementForUpdateType = Awaited<
  ReturnType<typeof hodGetAnnouncementForUpdate>
>;
