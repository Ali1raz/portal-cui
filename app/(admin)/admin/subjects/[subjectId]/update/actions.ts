"use server";

import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { errorMessage } from "@/lib/error-message";
import { requirePermission } from "@/app/data/permission/require-permission";
import { subjectSchema, SubjectSchemaType } from "../../../schema";

/// Update subject details.
export async function updateSubject(
  subjectId: string,
  values: SubjectSchemaType
): Promise<ApiResponseType> {
  try {
    const can = await requirePermission({
      subject: ["update"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update subjects.",
      };
    }

    const validated = subjectSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: validated.data.name,
        code: validated.data.code,
        creditHours: validated.data.creditHours,
      },
    });

    return {
      status: "success",
      message: "Subject updated successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
