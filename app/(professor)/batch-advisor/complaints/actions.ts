"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { errorMessage } from "@/lib/error-message";
import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";

export async function baUpdateComplaintStatus({
  complaintId,
  status,
  remarks,
}: {
  complaintId: string;
  status: ComplaintStatus;
  remarks: string | undefined;
}): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    // Authorization check
    const can = await requirePermission({
      complaints: ["update"],
    });

    if (!can) {
      return { status: "error", message: "Unauthorized action." };
    }

    const ba = await prisma.batchAdvisor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!ba || !ba.department) {
      return { status: "error", message: "Batch advsior profile missing" };
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: complaintId,
        targetDepartment: ba.department,
        status: "BA_PENDING",
      },
    });

    if (!complaint) {
      return {
        status: "error",
        message: "Complaint not found.",
      };
    }

    await prisma.$transaction([
      prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status,
          baRemarks: remarks,
          baReviewedAt: new Date(),
        },
      }),
      prisma.complaintReview.create({
        data: {
          complaintId,
          actorRole: "BATCH_ADVISOR",
          actorId: session.user.id,
          action: status === "HOD_PENDING" ? "BA_ACCEPTED" : "BA_REJECTED",
          remarks: remarks ?? null,
          fromStatus: "BA_PENDING",
          toStatus: status,
          department: ba.department,
          batchAdvisorId: ba.id,
        },
      }),
    ]);

    return {
      status: "success",
      message: "Status updated successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
