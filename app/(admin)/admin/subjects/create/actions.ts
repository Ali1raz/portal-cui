"use server";

import { ApiResponseType } from "@/lib/types";
import { subjectSchema, SubjectSchemaType } from "../../schema";
import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";

export async function createSubject(
  values: SubjectSchemaType
): Promise<ApiResponseType> {
  try {
    const can = await requirePermission({
      subject: ["create"],
    });
    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create subject",
      };
    }
    const validated = subjectSchema.safeParse(values);
    if (!validated.success) {
      return { status: "error", message: "Invalid form data." };
    }

    await prisma.subject.create({
      data: {
        name: values.name,
        code: values.code,
        creditHours: values.creditHours,
      },
    });

    return {
      status: "success",
      message: "Subject created successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
