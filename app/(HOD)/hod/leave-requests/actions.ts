"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function bulkUpdateLeaveRequestStatus(
  requestIds: string[],
  status: LeaveStatus
): Promise<ApiResponseType> {
  try {
    const can = await requirePermission({
      leaveRequest: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update leave requests",
      };
    }

    if (requestIds.length === 0) {
      return {
        status: "error",
        message: "No leave requests selected",
      };
    }

    await prisma.leaveRequest.updateMany({
      where: {
        id: { in: requestIds },
      },
      data: {
        status,
      },
    });

    revalidatePath("/hod/leave-requests");

    return {
      status: "success",
      message: `Successfully updated ${requestIds.length} leave ${requestIds.length === 1 ? "request" : "requests"}`,
    };
  } catch {
    return {
      status: "error",
      message: "Failed to bulk update leave requests",
    };
  }
}

export async function updateStatus(
  requestId: string,
  status: LeaveStatus
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const can = await requirePermission({
      leaveRequest: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update leave request",
      };
    }

    const req = await prisma.leaveRequest.findFirst({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!req) {
      return {
        status: "error",
        message: "Leave request not found.",
      };
    }
    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: status,
        },
      });

      await tx.leaveRequestReview.create({
        data: {
          leaveRequestId: requestId,
          actorRole: "HOD",
          actorId: session.user.id,
          action: status === "APPROVED" ? "HOD_APPROVED" : "HOD_REJECTED",
          remarks: "Leave request updated by HOD",
          fromStatus: req.status,
          toStatus: "PENDING",
        },
      });
    });

    return {
      status: "success",
      message: "Status updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update status",
    };
  }
}
