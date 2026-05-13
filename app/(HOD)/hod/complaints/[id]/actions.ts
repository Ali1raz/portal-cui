"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { categoryToDepartment } from "@/lib/utils";

const HOD_VALID_ACTIONS: ComplaintStatus[] = [
  "HOD_ACCEPTED",
  "HOD_REJECTED",
  "ASSIGNED",
];

export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  hodRemarks?: string
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await getArcjetDeniedMessage(session.user.id);
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      complaints: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update complaint status",
      };
    }

    if (!HOD_VALID_ACTIONS.includes(status)) {
      return {
        status: "error",
        message: "Invalid status. HOD can only Accept or Reject.",
      };
    }

    const hod = await prisma.hod.findUnique({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!hod || !hod.department) {
      return {
        status: "error",
        message: "HOD profile not found",
      };
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        id: complaintId,
        student: {
          department: hod.department,
        },
      },
      select: { id: true, status: true, category: true },
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
        },
      }),
      prisma.complaintAssignment.create({
        data: {
          complaintId,
          toDepartment: categoryToDepartment(complaint.category),
        },
      }),
      prisma.complaintReview.create({
        data: {
          complaintId,
          actorRole: "HOD",
          actorId: session.user.id,
          action:
            status === ComplaintStatus.HOD_ACCEPTED
              ? "HOD_ACCEPTED"
              : "HOD_REJECTED",
          remarks: hodRemarks ?? null,
          fromStatus: complaint.status,
          toStatus: status,
          department: hod.department,
        },
      }),
    ]);

    return {
      status: "success",
      message:
        status === ComplaintStatus.HOD_ACCEPTED
          ? "Complaint accepted and resolved."
          : "Complaint rejected.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
