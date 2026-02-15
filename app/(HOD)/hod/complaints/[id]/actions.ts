"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  hodRemarks?: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();
    const can = await requirePermission({
      complaints: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update complaint status",
      };
    }

    const hod = await prisma.hod.findUnique({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!hod) {
      return {
        status: "error",
        message: "HOD not found",
      };
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        id: complaintId,
        targetDepartment: hod.department,
      },
    });

    if (!complaint) {
      return {
        status: "error",
        message: "Complaint not found.",
      };
    }

    await prisma.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status: status,
        ...(hodRemarks && { hodRemarks }),
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
