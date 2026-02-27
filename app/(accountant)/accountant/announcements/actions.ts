"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { AnnouncementStatus } from "@/lib/generated/prisma/enums";
import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import {
  accountantAnnouncementSchema,
  AccountantAnnouncementSchemaType,
} from "./schema";

export async function accountantCreateAnnouncement(
  values: AccountantAnnouncementSchemaType
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

    const validated = accountantAnnouncementSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data." };
    }

    const accountant = await prisma.accountant.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!accountant) {
      return {
        status: "error",
        message: "Accountant profile not found.",
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
          : validated.data.status,
        authorId: session.user.id,
        targetDepartment: validated.data.targetDepartment || null,
        targetProgram: validated.data.targetProgram || null,
        targetBatch: validated.data.targetBatch || null,
        targetYear: validated.data.targetYear || null,
        scheduledFor,
        isPinned: validated.data.isPinned ?? false,
        imageKey: validated.data.imageKey?.trim() || null,
      },
      select: { id: true },
    });

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
      message: `Announcement created as ${validated.data.status}.`,
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function accountantUpdateAnnouncement(
  announcementId: string,
  values: AccountantAnnouncementSchemaType
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

    const validated = accountantAnnouncementSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data." };
    }

    const accountant = await prisma.accountant.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!accountant) {
      return {
        status: "error",
        message: "Accountant profile not found.",
      };
    }

    const existing = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
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
        targetDepartment: validated.data.targetDepartment || null,
        targetProgram: validated.data.targetProgram || null,
        targetBatch: validated.data.targetBatch || null,
        targetYear: validated.data.targetYear || null,
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

export async function accountantDeleteAnnouncement(
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

    const accountant = await prisma.accountant.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!accountant) {
      return {
        status: "error",
        message: "Accountant profile not found.",
      };
    }

    const an = await prisma.announcement.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!an) {
      return {
        status: "error",
        message: "Announcement not found",
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

/// Bulk delete multiple announcements by IDs.
export async function accountantBulkDeleteAnnouncements(
  ids: string[]
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      announcements: ["delete"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete announcements",
      };
    }

    if (!ids || ids.length === 0) {
      return {
        status: "error",
        message: "No announcements selected",
      };
    }

    const accountant = await prisma.accountant.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!accountant) {
      return {
        status: "error",
        message: "Accountant profile not found.",
      };
    }

    // Verify all announcements belong to this accountant
    const announcements = await prisma.announcement.findMany({
      where: {
        id: { in: ids },
        authorId: session.user.id,
      },
      select: { id: true },
    });

    if (announcements.length === 0) {
      return {
        status: "error",
        message: "No valid announcements found to delete",
      };
    }

    const validIds = announcements.map((a) => a.id);

    await prisma.announcement.deleteMany({
      where: { id: { in: validIds } },
    });

    return {
      status: "success",
      message: `Successfully deleted ${validIds.length} ${validIds.length === 1 ? "announcement" : "announcements"}`,
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

/// Bulk update status for multiple announcements.
export async function accountantBulkUpdateAnnouncementStatus(
  ids: string[],
  newStatus: AnnouncementStatus
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      announcements: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update announcements",
      };
    }

    if (!ids || ids.length === 0) {
      return {
        status: "error",
        message: "No announcements selected",
      };
    }

    if (!Object.values(AnnouncementStatus).includes(newStatus)) {
      return {
        status: "error",
        message: "Invalid status value",
      };
    }

    const accountant = await prisma.accountant.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!accountant) {
      return {
        status: "error",
        message: "Accountant profile not found.",
      };
    }

    // Verify all announcements belong to this accountant
    const announcements = await prisma.announcement.findMany({
      where: {
        id: { in: ids },
        authorId: session.user.id,
      },
      select: { id: true, status: true },
    });

    if (announcements.length === 0) {
      return {
        status: "error",
        message: "No valid announcements found to update",
      };
    }

    const validIds = announcements.map((a) => a.id);

    // Update status and set publishedAt if changing to PUBLISHED
    await prisma.announcement.updateMany({
      where: { id: { in: validIds } },
      data: {
        status: newStatus,
        ...(newStatus === AnnouncementStatus.PUBLISHED && {
          publishedAt: new Date(),
        }),
      },
    });

    return {
      status: "success",
      message: `Successfully updated ${validIds.length} ${validIds.length === 1 ? "announcement" : "announcements"} to ${newStatus}`,
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
