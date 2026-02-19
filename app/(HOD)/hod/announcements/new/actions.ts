"use server";

import { ApiResponseType } from "@/lib/types";
import { announcementSchema, AnnouncementSchemaType } from "../schema";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireHodSession } from "@/app/data/hod/require-hod-session";
import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";
import { AnnouncementStatus } from "@/lib/generated/prisma/enums";
import { inngest } from "@/lib/inngest/client";

/// Creates a draft announcement for the current HOD.
export async function createAnnouncement(
  values: AnnouncementSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireHodSession();

    const can = await requirePermission({
      announcements: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create announcements.",
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

    const ann = await prisma.announcement.create({
      data: {
        title: validated.data.title.trim(),
        content: validated.data.content.trim(),
        type: validated.data.type,
        status: validated.data.scheduledFor
          ? AnnouncementStatus.SCHEDULED
          : AnnouncementStatus.DRAFT,
        authorId: session.user.id,
        targetDepartment: hod.department,
        scheduledFor,
        isPinned: validated.data.isPinned ?? false,
        imageKey: validated.data.imageKey?.trim() || null,
      },
      select: { id: true },
    });

    if (scheduledFor) {
      await inngest.send({
        name: "announcement/scheduled", // event name
        data: {
          announcementId: ann.id,
          scheduleDate: scheduledFor.toISOString(),
        },
      });

      return {
        status: "success",
        message: `Announcement scheduled for ${scheduledFor.toLocaleString()}`,
      };
    }

    return {
      status: "success",
      message: "Announcement created as draft.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
