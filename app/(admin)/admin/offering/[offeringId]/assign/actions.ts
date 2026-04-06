"use server";

import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { errorMessage } from "@/lib/error-message";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { assignTeacherSchema, AssignTeacherSchemaType } from "./schema";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { format } from "date-fns";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "24h",
    max: 50,
  })
);

/// Assign or reassign a professor to an offering.
export async function assignTeacherToOffering(
  offeringId: string,
  values: AssignTeacherSchemaType
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

    await prisma.$transaction(async (tx) => {
      await tx.teachingAssignment.deleteMany({
        where: {
          offeringId,
          section: validated.data.section,
          professorId: {
            not: validated.data.professorId,
          },
        },
      });

      await tx.teachingAssignment.upsert({
        where: {
          professorId_offeringId_section: {
            professorId: validated.data.professorId,
            offeringId,
            section: validated.data.section,
          },
        },
        update: {
          section: validated.data.section,
        },
        create: {
          offeringId,
          professorId: validated.data.professorId,
          section: validated.data.section,
        },
      });
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
