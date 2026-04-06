"use server";

import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { errorMessage } from "@/lib/error-message";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { subjectSchema, SubjectSchemaType } from "../../../schema";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { format } from "date-fns";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "24h",
    max: 20,
  })
);

/// Update subject details.
export async function updateSubject(
  subjectId: string,
  values: SubjectSchemaType
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: `You are making too many requests. Please try again later on: ${format(decision.reason.resetTime as Date, "MMMM d, yyyy hh:mm a")}`,
        };
      }
      return {
        status: "error",
        message: "You have been blocked.",
      };
    }

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
