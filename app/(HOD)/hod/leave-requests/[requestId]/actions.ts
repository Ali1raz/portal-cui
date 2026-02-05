"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { errorMessage } from "@/lib/error-message";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

export async function updateStatus(
  requestId: string,
  status: LeaveStatus
): Promise<ApiResponseType> {
  try {
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
    });

    if (!req) {
      return {
        status: "error",
        message: "Leave request not found.",
      };
    }

    await prisma.leaveRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: status,
      },
    });

    return {
      status: "success",
      message: "Status updated successfully",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
