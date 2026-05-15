"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { AnnouncementStatus } from "@/lib/generated/prisma/enums";
import { inngest } from "@/lib/inngest/client";
import { protect } from "@/lib/arcjet-protect";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { adminAnnouncementSchema, AdminAnnouncementSchemaType } from "./schema";

/// Creates a new announcement with targeting options.
export async function adminCreateAnnouncement(
  values: AdminAnnouncementSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      announcements: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create announcements.",
      };
    }

    // Validate input
    const validated = adminAnnouncementSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data. Please check your inputs.",
      };
    }

    const data = validated.data;

    // Validate scheduled date
    const scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;

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

    // Create the announcement
    const ann = await prisma.announcement.create({
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        type: data.type,
        status: scheduledFor
          ? AnnouncementStatus.SCHEDULED
          : data.status || AnnouncementStatus.DRAFT,
        imageKey: data.imageKey?.trim() || null,
        isPinned: data.isPinned ?? false,
        scheduledFor,
        targetDepartment: data.targetDepartment || null,
        authorId: session.user.id,
        publishedAt:
          data.status === AnnouncementStatus.PUBLISHED && !scheduledFor
            ? new Date()
            : null,
      },
      select: { id: true },
    });

    // Schedule announcement if needed
    if (scheduledFor) {
      await inngest.send({
        name: "announcement/scheduled",
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
      message:
        data.status === AnnouncementStatus.PUBLISHED
          ? "Announcement published successfully."
          : "Announcement created as draft.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function adminUpdateAnnouncement(
  announcementId: string,
  values: AdminAnnouncementSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      announcements: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update announcements.",
      };
    }

    // Validate input
    const validated = adminAnnouncementSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data. Please check your inputs.",
      };
    }

    const data = validated.data;

    // Verify announcement exists
    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      return {
        status: "error",
        message: "Announcement not found.",
      };
    }

    // Only allow author to update announcement
    if (existing.authorId !== session.user.id) {
      return {
        status: "error",
        message: "You can only update announcements you created.",
      };
    }

    // Validate scheduled date
    const scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;

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

    // Update the announcement
    await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        type: data.type,
        status: scheduledFor
          ? AnnouncementStatus.SCHEDULED
          : data.status || AnnouncementStatus.DRAFT,
        imageKey: data.imageKey?.trim() || null,
        isPinned: data.isPinned ?? false,
        scheduledFor,
        targetDepartment: data.targetDepartment || null,
        publishedAt:
          data.status === AnnouncementStatus.PUBLISHED && !scheduledFor
            ? new Date()
            : undefined,
      },
    });

    return {
      status: "success",
      message: "Announcement updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

/// Deletes a single announcement.
export async function adminDeleteAnnouncement(
  id: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      announcements: ["delete"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete announcements.",
      };
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!announcement) {
      return {
        status: "error",
        message: "Announcement not found.",
      };
    }

    await prisma.announcement.delete({
      where: { id: announcement.id },
    });

    return {
      status: "success",
      message: "Successfully deleted announcement.",
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function adminBulkDeleteAnnouncements(
  ids: string[]
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      announcements: ["delete"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete announcements.",
      };
    }

    if (!ids || ids.length === 0) {
      return {
        status: "error",
        message: "No announcements selected.",
      };
    }

    // Verify announcements exist
    const announcements = await prisma.announcement.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (announcements.length === 0) {
      return {
        status: "error",
        message: "No valid announcements found to delete.",
      };
    }

    const validIds = announcements.map((a) => a.id);

    await prisma.announcement.deleteMany({
      where: { id: { in: validIds } },
    });

    return {
      status: "success",
      message: `Successfully deleted ${validIds.length} ${validIds.length === 1 ? "announcement" : "announcements"}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
