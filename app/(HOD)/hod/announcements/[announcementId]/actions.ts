"use server";

import { ApiResponseType } from "@/lib/types";
import { announcementSchema, AnnouncementSchemaType } from "../schema";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireHodSession } from "@/app/data/hod/require-hod-session";
import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";
import { revalidatePath } from "next/cache";

/// Updates an existing announcement for the current HOD.
export async function updateAnnouncement(
  announcementId: string,
  values: AnnouncementSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireHodSession();

    const can = await requirePermission({
      announcements: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update announcements.",
      };
    }

    const validated = announcementSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data." };
    }

    const hod = await prisma.hod.findFirst({
      where: { userId: session.user.id },
      select: { department: true },
    });

    if (!hod) {
      return {
        status: "error",
        message: "HOD profile not found.",
      };
    }

    const existing = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        targetDepartment: hod.department,
        authorId: session.user.id,
      },
    });

    if (!existing) {
      return {
        status: "error",
        message: "Announcement not found or unauthorized.",
      };
    }

    const scheduledFor = validated.data.scheduledFor
      ? new Date(validated.data.scheduledFor)
      : null;

    if (scheduledFor && scheduledFor < new Date()) {
      return {
        status: "error",
        message: "Scheduled time must be in the future.",
      };
    }

    if (scheduledFor) {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 2);
      if (scheduledFor > maxDate) {
        return {
          status: "error",
          message: "Announcements can only be scheduled up to 2 days from now.",
        };
      }
    }

    await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: validated.data.title.trim(),
        content: validated.data.content.trim(),
        type: validated.data.type,
        scheduledFor,
        isPinned: validated.data.isPinned ?? false,
        imageKey: validated.data.imageKey?.trim() || null,
      },
    });

    revalidatePath("/hod/announcements");

    return {
      status: "success",
      message: "Announcement updated successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
