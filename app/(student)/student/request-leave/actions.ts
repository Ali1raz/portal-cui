"use server";

import { ApiResponseType } from "@/lib/types";
import { LeaveRequestFormType, leaveRequestSchema } from "./schema";
import prisma from "@/lib/prisma";

export async function sendLeaveRequest(
  data: LeaveRequestFormType,
  studentId: string
): Promise<ApiResponseType> {
  try {
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
      message: "Leave request sent successfully.",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to send leave request.",
    };
  }
}
