"use server";

import { ApiResponseType } from "@/lib/types";
import { subjectSchema, SubjectSchemaType } from "../../schema";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";
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

export async function createSubject(
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
    const subj = await prisma.subject.count({
      where: {
        code: values.code,
      },
    });

    if (subj)
      return {
        status: "error",
        message: `Subject code ${values.code} already exists`,
      };

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
