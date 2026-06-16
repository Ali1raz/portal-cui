"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { protect } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import { LRAction, LeaveStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { SendEmail } from "@/app/actions/send-email";
import {
  baUpdateLeaveRequestStatusSchema,
  type BaUpdateLeaveRequestStatusInput,
} from "./schemas";
import { env } from "@/lib/env";

const BA_REVIEWABLE_STATUSES: LeaveStatus[] = ["PENDING", "REVIEW_REQUESTED"];

function mapActionByStatus(status: LeaveStatus): LRAction {
  if (status === "HOD_PENDING") {
    return "BA_APPROVED";
  }
  if (status === "REVIEW_REQUESTED") {
    return "BA_REVIEW_REQUESTED";
  }
  return "BA_REJECTED";
}

export async function baUpdateLeaveRequestStatus(
  data: BaUpdateLeaveRequestStatusInput
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id, {
      action: "batch_advisor:leave_request:update_status",
      max: 15,
    });
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    const can = await requirePermission({
      leaveRequest: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update leave requests.",
      };
    }

    const { data: parsed, success } =
      baUpdateLeaveRequestStatusSchema.safeParse(data);

    if (!success) {
      return {
        status: "error",
        message: "Invalid input.",
      };
    }

    const ba = await prisma.batchAdvisor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, department: true },
    });

    if (!ba) {
      return {
        status: "error",
        message: "Batch advisor profile missing.",
      };
    }

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id: parsed.leaveRequestId,
        student: {
          department: ba.department,
        },
      },
      select: {
        id: true,
        status: true,
        student: { select: { user: { select: { email: true, name: true } } } },
      },
    });

    if (!leaveRequest) {
      return {
        status: "error",
        message: "Leave request not found.",
      };
    }

    if (!BA_REVIEWABLE_STATUSES.includes(leaveRequest.status)) {
      return {
        status: "error",
        message: "This leave request has already been reviewed.",
      };
    }

    if (
      !BA_REVIEWABLE_STATUSES.includes(parsed.status as LeaveStatus) &&
      parsed.status !== "HOD_PENDING" &&
      parsed.status !== "REJECTED"
    ) {
      return {
        status: "error",
        message: "Invalid status transition.",
      };
    }

    await prisma.$transaction([
      prisma.leaveRequest.update({
        where: { id: parsed.leaveRequestId },
        data: {
          status: parsed.status,
        },
      }),
      prisma.leaveRequestReview.create({
        data: {
          leaveRequestId: parsed.leaveRequestId,
          actorRole: "BATCH_ADVISOR",
          actorId: session.user.id,
          action: mapActionByStatus(parsed.status),
          remarks: parsed.remarks?.trim() ? parsed.remarks.trim() : null,
          fromStatus: leaveRequest.status,
          toStatus: parsed.status,
        },
      }),
    ]);

    const studentEmail = leaveRequest.student.user.email;
    const studentName = leaveRequest.student.user.name;
    if (studentEmail) {
      if (parsed.status === "REVIEW_REQUESTED") {
        await SendEmail({
          to: studentEmail,
          subject: "Leave request: more information requested",
          meta: {
            description: `Dear ${studentName}, the batch advisor has requested more information for your leave request. Remarks: ${parsed.remarks}`,
            link: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/student/past-leave-requests/${parsed.leaveRequestId}`,
          },
        });
      } else if (parsed.status === "REJECTED") {
        await SendEmail({
          to: studentEmail,
          subject: "Leave request: rejected",
          meta: {
            description: `Dear ${studentName}, your leave request has been rejected by the batch advisor. Remarks: ${parsed.remarks ?? "(none)"}`,
            link: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/student/past-leave-requests/${parsed.leaveRequestId}`,
          },
        });
      }
    }

    return {
      status: "success",
      message:
        parsed.status === "HOD_PENDING"
          ? "Request forwarded to HOD successfully."
          : parsed.status === "REVIEW_REQUESTED"
            ? "Student has been asked to provide more information."
            : "Leave request rejected successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
