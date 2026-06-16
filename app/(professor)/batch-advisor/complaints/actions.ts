"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { protect } from "@/lib/arcjet-protect";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import { SendEmail } from "@/app/actions/send-email";
import { ApiResponseType } from "@/lib/types";
import {
  BaUpdateComplaintStatusInput,
  baUpdateComplaintStatusSchema,
} from "./schemas";
import { ALREADY_REVIEWED_COMPLAINT_STATUS } from "@/lib/data/utils";
import { env } from "@/lib/env";

export async function baUpdateComplaintStatus(
  data: BaUpdateComplaintStatusInput
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const deniedMessage = await protect(session.user.id, {
      action: "batch_advisor:complaint:update_status",
      max: 15,
    });
    if (deniedMessage) {
      return {
        status: "error",
        message: deniedMessage,
      };
    }

    // Authorization check
    const can = await requirePermission({
      complaints: ["update"],
    });

    if (!can) {
      return { status: "error", message: "Unauthorized action." };
    }

    const { data: parsed, success } =
      baUpdateComplaintStatusSchema.safeParse(data);

    if (!success) {
      return { status: "error", message: "Invalid input." };
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
        id: parsed.complaintId,
        student: {
          department: ba.department,
        },
        status: {
          notIn: ALREADY_REVIEWED_COMPLAINT_STATUS,
        },
      },
      select: {
        status: true,
        title: true,
        student: { select: { user: { select: { email: true, name: true } } } },
      },
    });

    if (!complaint) {
      return {
        status: "error",
        message: "Complaint not found or already reviewed.",
      };
    }

    await prisma.$transaction([
      prisma.complaint.update({
        where: { id: parsed.complaintId },
        data: {
          status: parsed.status,
        },
      }),
      prisma.complaintReview.create({
        data: {
          complaintId: parsed.complaintId,
          actorRole: "BATCH_ADVISOR",
          actorId: session.user.id,
          action:
            parsed.status === "HOD_PENDING" ? "BA_ACCEPTED" : parsed.status,
          remarks: parsed.remarks ?? null,
          fromStatus: complaint.status,
          toStatus: parsed.status,
          department: ba.department,
          batchAdvisorId: ba.id,
        },
      }),
    ]);

    // Notify student when BA asks for more info or rejects the complaint

    const studentEmail = complaint.student.user.email;
    const studentName = complaint.student.user.name;
    if (studentEmail) {
      if (parsed.status === "BA_REVIEW_REQUESTED") {
        await SendEmail({
          to: studentEmail,
          subject: "Complaint: more information requested",
          meta: {
            description: `Dear ${studentName}, the batch advisor has asked for more information about your complaint \"${complaint.title}\". Please update and resubmit. Remarks: ${parsed.remarks}`,
            link: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/student/complaints/${parsed.complaintId}`,
          },
        });
      } else if (parsed.status === "BA_REJECTED") {
        await SendEmail({
          to: studentEmail,
          subject: "Complaint: rejected",
          meta: {
            description: `Dear ${studentName}, your complaint \"${complaint.title}\" has been rejected by the batch advisor. Remarks: ${parsed.remarks}`,
            link: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/student/complaints/${parsed.complaintId}`,
          },
        });
      }
    }

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
