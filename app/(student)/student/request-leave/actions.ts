"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { LeaveRequestFormType, leaveRequestSchema } from "./schema";

export async function sendLeaveRequest(
  data: LeaveRequestFormType,
  studentId: string
): Promise<ApiResponseType> {
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
