"use server";

import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import { requirePermission } from "@/app/data/permission/require-permission";
import { createOfferingSchema, CreateOfferingSchemaInputType } from "../schema";

/// Create a new subject offering and assign a professor.
/// Result for offering creation.
type CreateOfferingResult = ApiResponseType & {
  offeringId?: string;
};

export async function createOffering(
  values: CreateOfferingSchemaInputType
): Promise<CreateOfferingResult> {
  try {
    const can = await requirePermission({
      subjectOfferings: ["create"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create offerings.",
      };
    }

    const validated = createOfferingSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data." };
    }

    const result = validated.data;

    const semester = await prisma.semester.findUnique({
      where: {
        id: result.semesterId,
      },
      select: {
        id: true,
        department: true,
      },
    });

    if (!semester) {
      return {
        status: "error",
        message: "Selected semester does not exist.",
      };
    }

    const existing = await prisma.subjectOffering.count({
      where: {
        subjectId: result.subjectId,
        semesterId: semester.id,
        department: semester.department,
      },
    });

    if (existing) {
      return {
        status: "error",
        message: "This offering already exists",
      };
    }

    const offering = await prisma.subjectOffering.create({
      data: {
        subjectId: result.subjectId,
        semesterId: semester.id,
        totalLectures: result.totalLectures,
        department: semester.department,
      },
    });

    return {
      status: "success",
      message: "Offering created successfully.",
      offeringId: offering.id,
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
