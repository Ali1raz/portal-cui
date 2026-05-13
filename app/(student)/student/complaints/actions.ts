"use server";

import { ApiResponseType } from "@/lib/types";
import { complaintSchema, ComplaintSchemaType } from "./schema";
import { errorMessage } from "@/lib/error-message";
import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { requireSession } from "@/app/data/session/require-session";
import { ALREADY_REVIEWED_COMPLAINT_STATUS } from "@/lib/data/utils";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { format } from "date-fns";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "24h",
    max: 5,
  })
);

export async function CreateComplaint(
  values: ComplaintSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: `You are making too many requests. Please try again later on: ${format(decision.reason.resetTime as Date, "MMMM d, yyyy hh:mm a")}`,
        };
      }
      return {
        status: "error",
        message: "You have been blocked.",
      };
    }

    const can = await requirePermission({
      complaints: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create complaints",
      };
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!student) {
      return {
        status: "error",
        message: "Not student",
      };
    }

    const validated = complaintSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.complaint.create({
      data: {
        studentId: student.id,
        ...validated.data,
      },
    });

    return {
      status: "success",
      message: "Complaint created successfully",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function UpdateComplaint(
  id: string,
  values: ComplaintSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You are making too many requests. Please try again later.",
        };
      }
      return {
        status: "error",
        message: "You have been blocked.",
      };
    }

    const can = await requirePermission({
      complaints: ["update:own"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update complaints",
      };
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!student || !student.department) {
      return {
        status: "error",
        message: "Student profile missing",
      };
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        studentId: student.id,
      },
      select: { id: true, status: true },
    });

    if (!complaint) {
      return {
        status: "error",
        message: "Complaint not found",
      };
    }

    if (ALREADY_REVIEWED_COMPLAINT_STATUS.includes(complaint.status)) {
      return {
        status: "error",
        message: "This complaint cannot be updated anymore",
      };
    }

    const validated = complaintSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.complaint.update({
        where: { id: complaint.id },
        data: {
          title: validated.data.title,
          details: validated.data.details,
          category: validated.data.category,
          imageKey: validated.data.imageKey?.trim() ?? null,
          status: "BA_PENDING", // Reset to pending if it was rejected
        },
      });
      await tx.complaintReview.create({
        data: {
          complaintId: complaint.id,
          actorRole: "STUDENT",
          actorId: session.user.id,
          action: "RESUBMITTED",
          remarks: "Complaint updated after revision",
          fromStatus: complaint.status,
          toStatus: "BA_PENDING",
          department: student.department,
        },
      });
    });

    return {
      status: "success",
      message: "Complaint updated successfully",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function DeleteComplaint(id: string): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You are making too many requests. Please try again later.",
        };
      }
      return {
        status: "error",
        message: "You have been blocked.",
      };
    }

    const can = await requirePermission({
      complaints: ["delete:own"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete complaints",
      };
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return {
        status: "error",
        message: "Not student",
      };
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        studentId: student.id,
      },
      select: { id: true, status: true },
    });

    if (!complaint) {
      return {
        status: "error",
        message: "Complaint not found",
      };
    }

    if (
      complaint.status !== "BA_PENDING" &&
      complaint.status !== "BA_REJECTED"
    ) {
      return {
        status: "error",
        message: "Only pending complaints can be deleted",
      };
    }

    await prisma.complaint.delete({
      where: {
        id: complaint.id,
      },
    });

    return {
      status: "success",
      message: "Complaint deleted successfully",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
