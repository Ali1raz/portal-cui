"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { errorMessage } from "@/lib/error-message";
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
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
