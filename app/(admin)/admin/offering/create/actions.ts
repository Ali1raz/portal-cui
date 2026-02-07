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

    const offering = await prisma.subjectOffering.create({
      data: {
        subjectId: result.subjectId,
        semester: result.semester,
        year: result.year,
        section: result.section,
        totalLectures: result.totalLectures,
        department: result.department,
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
