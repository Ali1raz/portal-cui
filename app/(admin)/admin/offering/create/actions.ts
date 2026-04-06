"use server";

import prisma from "@/lib/prisma";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import { requirePermission } from "@/app/data/permission/require-permission";
import { requireSession } from "@/app/data/session/require-session";
import { createOfferingSchema, CreateOfferingSchemaInputType } from "../schema";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { format } from "date-fns";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1h",
    max: 10,
  })
);

type CreateOfferingResult = ApiResponseType & {
  offeringId?: string;
};

export async function createOffering(
  values: CreateOfferingSchemaInputType
): Promise<CreateOfferingResult> {
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
    const now = new Date();

    const semester = await prisma.semester.findUnique({
      where: {
        id: result.semesterId,
      },
      select: {
        id: true,
        department: true,
        isActive: true,
        addDeadline: true,
      },
    });

    if (!semester) {
      return {
        status: "error",
        message: "Selected semester does not exist.",
      };
    }

    if (semester.addDeadline < now) {
      return {
        status: "error",
        message: "Deadline has passed already.",
      };
    }

    if (!semester.isActive) {
      return {
        status: "error",
        message: "Selected semester is inactive.",
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
        message: "This offering already exists.",
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
