"use server";

import prisma from "@/lib/prisma";
import { requireSession } from "@/app/data/session/require-session";
import { requirePermission } from "@/app/data/permission/require-permission";
import { errorMessage } from "@/lib/error-message";
import type { ApiResponseType } from "@/lib/types";

export async function markAttendanceAsLeave({
  studentId,
  attendanceRecordId,
}: {
  studentId: string;
  attendanceRecordId: string;
}): Promise<ApiResponseType> {
  await requireSession();

  try {
    // Check permission
    const can = await requirePermission({
      attendance: ["update"],
    });

    if (!can) {
      return {
        message: "Unauthorized",
        status: "error",
      };
    }

    // Verify the attendance record exists
    const attendanceRecord = await prisma.attendanceRecord.findUnique({
      where: { id: attendanceRecordId },
    });

    if (!attendanceRecord) {
      return {
        status: "error",
        message: "Attendance record not found.",
      };
    }

    // Update the student attendance to LEAVE
    await prisma.studentAttendance.upsert({
      where: {
        recordId_studentId: {
          recordId: attendanceRecordId,
          studentId,
        },
      },
      create: {
        recordId: attendanceRecordId,
        studentId,
        status: "LEAVE",
      },
      update: {
        status: "LEAVE",
      },
    });

    return {
      status: "success",
      message: "Attendance marked as leave successfully.",
    };
  } catch (error) {
    console.error("Error marking attendance as leave:", error);
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
