"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { LeaveRequestFormType, leaveRequestSchema } from "./schema";
import { requireSession } from "@/app/data/session/require-session";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";

export async function sendLeaveRequest(
  data: LeaveRequestFormType,
  studentId: string
): Promise<ApiResponseType> {
  const session = await requireSession();

  const deniedMessage = await getArcjetDeniedMessage(session.user.id);
  if (deniedMessage) {
    return {
      status: "error",
      message: deniedMessage,
    };
  }

  try {
    const can = await requirePermission({
      leaveRequest: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create leave requests",
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

    const existingRequest = await prisma.leaveRequest.findFirst({
      where: {
        studentId: studentId,
        offeringId: offering.id,
        date: new Date(validated.data.date),
      },
    });

    if (existingRequest) {
      return {
        status: "error",
        message: "You have already requested leave for this date.",
      };
    }

    await prisma.leaveRequest.create({
      data: {
        studentId: studentId,
        date: new Date(validated.data.date),
        reasonTitle: validated.data.reasonTitle,
        reasonDetails: validated.data.reasonDetails,
        imageKey: validated.data.imageKey,
        offeringId: offering.id,
      },
    });

    return {
      status: "success",
      message: "Leave request created successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create leave request.",
    };
  }
}
