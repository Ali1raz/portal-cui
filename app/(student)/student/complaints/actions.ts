"use server";

import { ApiResponseType } from "@/lib/types";
import { complaintSchema, ComplaintSchemaType } from "./schema";
import { errorMessage } from "@/lib/error-message";
import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { requireSession } from "@/app/data/session/require-session";

export async function CreateComplaint(
  values: ComplaintSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

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
        targetDepartment: student.department,
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
        message: "Student profile  missing",
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
        message: "Only pending or rejected complaints can be updated",
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

      if (complaint.status === "BA_REJECTED") {
        await tx.complaintReview.create({
          data: {
            complaintId: complaint.id,
            actorRole: "STUDENT",
            actorId: session.user.id,
            action: "SUBMITTED",
            remarks: "Complaint updated after revision",
            fromStatus: "BA_REJECTED",
            toStatus: "BA_PENDING",
            department: student.department!,
          },
        });
      }
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
        message: "Only pending or returned complaints can be deleted",
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

/// Delete multiple complaints at once (bulk delete).
export async function BulkDeleteComplaints(
  ids: string[]
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      complaints: ["delete:own"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete complaints",
      };
    }

    if (!ids || ids.length === 0) {
      return {
        status: "error",
        message: "No complaints selected",
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

    // Delete all selected complaints that belong to the student
    const result = await prisma.complaint.deleteMany({
      where: {
        id: { in: ids },
        studentId: student.id,
        status: { in: ["BA_PENDING", "BA_REJECTED"] },
      },
    });

    const deletedCount = result.count;

    if (deletedCount === 0) {
      return {
        status: "error",
        message: "No valid complaints found to delete",
      };
    }

    return {
      status: "success",
      message: `Deleted ${deletedCount} complaint${deletedCount !== 1 ? "s" : ""}`,
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
