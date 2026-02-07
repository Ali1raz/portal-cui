"use server";

import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { errorMessage } from "@/lib/error-message";
import { requirePermission } from "@/app/data/permission/require-permission";
import { assignTeacherSchema, AssignTeacherSchemaType } from "./schema";

/// Assign or reassign a professor to an offering.
export async function assignTeacherToOffering(
  offeringId: string,
  values: AssignTeacherSchemaType
): Promise<ApiResponseType> {
  try {
    const can = await requirePermission({
      subjectOfferings: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to assign teachers.",
      };
    }

    const validated = assignTeacherSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
    }

    await prisma.teachingAssignment.upsert({
      where: { offeringId },
      update: {
        professorId: validated.data.professorId,
      },
      create: {
        offeringId,
        professorId: validated.data.professorId,
      },
    });

    return {
      status: "success",
      message: "Teacher assigned successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
