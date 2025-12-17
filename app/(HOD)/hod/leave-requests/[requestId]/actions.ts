"use server";

import { errorMessage } from "@/lib/error-message";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

export async function updateStatus(
  requestId: string,
  status: LeaveStatus
): Promise<ApiResponseType> {
  try {
    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status },
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
