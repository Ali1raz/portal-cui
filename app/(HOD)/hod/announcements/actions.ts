"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { AnnouncementStatus } from "@/lib/generated/prisma/enums";
import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { announcementSchema, AnnouncementSchemaType } from "./schema";

export async function hodCreateAnnouncement(
  values: AnnouncementSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

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

export async function hodUpdateAnnouncement(
  announcementId: string,
  values: AnnouncementSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

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
        message: "Announcement not found.",
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

export async function HodDeleteAnnouncement(
  id: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      announcements: ["delete"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete announcement",
      };
    }

    const hod = await prisma.hod.findFirst({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    const an = await prisma.announcement.findFirst({
      where: {
        id,
        targetDepartment: hod?.department,
      },
      select: {
        id: true,
      },
    });

    if (!an) {
      return {
        status: "error",
        message: "Announcement not fond",
      };
    }

    await prisma.announcement.delete({
      where: { id: an.id },
    });

    return { status: "success", message: "Successfully deleted announcement" };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
