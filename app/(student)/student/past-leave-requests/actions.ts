"use server";

import { ApiResponseType } from "@/lib/types";
import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { requireSession } from "@/app/data/session/require-session";
import { protect } from "@/lib/arcjet-protect";
import { EDITABLE_LEAVE_REQUEST_STATUS } from "@/lib/data/utils";
import {
  leaveRequestSchema,
  LeaveRequestFormType,
} from "../request-leave/schema";

export async function DeleteLeaveRequest(
  leaveRequestId: string
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
      leaveRequest: ["delete:own"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to delete leave requests",
      };
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!student || !student.department) {
      return {
        status: "error",
        message: "Not a student",
      };
    }

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        studentId: student.id,
      },
      select: { id: true, status: true },
    });

    if (!leaveRequest) {
      return {
        status: "error",
        message: "Leave request not found",
      };
    }

    if (!EDITABLE_LEAVE_REQUEST_STATUS.includes(leaveRequest.status)) {
      return {
        status: "error",
        message:
          "This leave request cannot be deleted as it has already been reviewed",
      };
    }

    await prisma.leaveRequest.delete({
      where: { id: leaveRequestId },
    });

    return {
      status: "success",
      message: "Leave request deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete leave request.",
    };
  }
}

export async function updateLeaveRequest(
  leaveRequestId: string,
  data: LeaveRequestFormType
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
      leaveRequest: ["update:own"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update leave requests",
      };
    }

    const student = await prisma.student.findFirst({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!student) {
      return {
        status: "error",
        message: "Not a student",
      };
    }

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id: leaveRequestId,
        studentId: student.id,
      },
      select: { id: true, status: true },
    });

    if (!leaveRequest) {
      return {
        status: "error",
        message: "Leave request not found",
      };
    }

    if (!EDITABLE_LEAVE_REQUEST_STATUS.includes(leaveRequest.status)) {
      return {
        status: "error",
        message:
          "This leave request cannot be updated as it has already been reviewed",
      };
    }

    const validated = leaveRequestSchema.safeParse(data);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    const offering = await prisma.subjectOffering.findFirst({
      where: { subjectId: validated.data.subjectId },
      select: { id: true },
    });

    if (!offering) {
      return {
        status: "error",
        message: "Subject offering not found",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          date: new Date(validated.data.date),
          reasonTitle: validated.data.reasonTitle,
          reasonDetails: validated.data.reasonDetails,
          imageKey: validated.data.imageKey,
          offeringId: offering.id,
          status: "PENDING", // Reset to PENDING on update
        },
      });

      await tx.leaveRequestReview.create({
        data: {
          leaveRequestId,
          actorRole: "STUDENT",
          actorId: session.user.id,
          action: "RESUBMITTED",
          remarks: "Leave request updated by student",
          fromStatus: leaveRequest.status,
          toStatus: "PENDING",
        },
      });
    });

    return {
      status: "success",
      message: "Leave request updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update leave request.",
    };
  }
}
