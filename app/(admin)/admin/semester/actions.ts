"use server";

import { requirePermission } from "@/app/data/permission/require-permission";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { createSemesterSchema, CreateSemesterSchemaInputType } from "./schema";

export async function createSemester(
  values: CreateSemesterSchemaInputType
): Promise<ApiResponseType> {
  try {
    const can = await requirePermission({
      semesters: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create semesters.",
      };
    }

    const validated = createSemesterSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
    }

    const result = validated.data;

    const existing = await prisma.semester.findFirst({
      where: {
        semester: result.semester,
        year: result.year,
        department: result.department,
        batch: result.batch,
      },
      select: { id: true },
    });

    if (existing) {
      return {
        status: "error",
        message:
          "This semester already exists for selected department and batch.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.semester.create({
        data: {
          semester: result.semester,
          year: result.year,
          department: result.department,
          batch: result.batch,
          startDate: result.startDate,
          endDate: result.endDate,
          registrationStart: result.registrationStart,
          registrationEnd: result.registrationEnd,
          enrollmentStart: result.enrollmentStart,
          enrollmentEnd: result.enrollmentEnd,
          addDeadline: result.addDeadline,
          dropDeadline: result.dropDeadline,
          lateDropDeadline: result.lateDropDeadline,
          isActive: result.isActive,
        },
      });
    });

    return {
      status: "success",
      message: "Semester created successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Error creating semester: " + errorMessage(error),
    };
  }
}
