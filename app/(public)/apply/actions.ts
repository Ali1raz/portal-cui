"use server";

import { requireSession } from "@/app/data/session/require-session";
import { requirePermission } from "@/app/data/permission/require-permission";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { errorMessage } from "@/lib/error-message";
import { applyFormSchema, ApplyFormSchemaType } from "../schema";
import { StudentApplicationStatus } from "@/lib/generated/prisma/enums";
import { SendEmail } from "@/app/actions/send-email";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";
import { env } from "@/lib/env";

function getApplicationTrackingLink(applicationId: string) {
  const appBaseUrl = env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "localhost:3000";

  if (!appBaseUrl) {
    return `/my-applications/${applicationId}`;
  }

  return `${appBaseUrl.replace(/\/$/, "")}/my-applications/${applicationId}`;
}

export async function submitApplication(
  values: ApplyFormSchemaType
): Promise<ApiResponseType> {
  const session = await requireSession();

  const deniedMessage = await getArcjetDeniedMessage(session.user.id);
  if (deniedMessage) {
    return {
      status: "error",
      message: deniedMessage,
    };
  }

  try {
    const can = await requirePermission({ applications: ["create"] });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to create an application.",
      };
    }
    const validated = applyFormSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data.",
      };
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Validate semester exists and registration window is still open
    const semester = await prisma.semester.findFirst({
      where: {
        id: validated.data.semesterId,
        year: currentYear,
        registrationStart: {
          lte: currentDate,
        },
        registrationEnd: {
          gte: currentDate,
        },
        department: validated.data.preferredDepartment,
        isActive: true,
      },
      select: {
        id: true,
        department: true,
        isActive: true,
        year: true,
        registrationStart: true,
        registrationEnd: true,
      },
    });

    if (!semester) {
      return {
        status: "error",
        message: "Selected semester not found.",
      };
    }

    // Check if registration window is still open
    if (!semester.isActive) {
      return {
        status: "error",
        message: "This semester is no longer active.",
      };
    }

    if (semester.registrationStart > currentDate) {
      return {
        status: "error",
        message: "Registration has not started yet.",
      };
    }

    if (semester.registrationEnd < currentDate) {
      return {
        status: "error",
        message: "Registration period has ended.",
      };
    }

    const existingActiveApplication = await prisma.studentApplication.findFirst(
      {
        where: {
          userId: session.user.id,
          status: {
            notIn: ["REJECTED"],
          },
        },
        select: {
          status: true,
        },
        orderBy: {
          attemptNo: "desc",
        },
      }
    );

    if (existingActiveApplication) {
      return {
        status: "error",
        message:
          existingActiveApplication.status ===
          StudentApplicationStatus.REVIEW_REQUESTED
            ? "You already have an application with review requested. Please update the same application."
            : "You already have a pending application.",
      };
    }

    const applicationId = await prisma.$transaction(async (tx) => {
      const prevAttempts = await tx.studentApplication.findFirst({
        where: {
          userId: session.user.id,
          semesterId: validated.data.semesterId,
        },
        select: {
          attemptNo: true,
        },
        orderBy: {
          attemptNo: "desc",
        },
      });

      const { id } = await tx.studentApplication.create({
        data: {
          address: validated.data.address,
          city: validated.data.city,
          dateOfBirth: validated.data.dateOfBirth,
          fullName: validated.data.fullName,
          gender: validated.data.gender,
          phoneNo: validated.data.phoneNo,
          percentage: validated.data.previousPercentage,
          preferredDepartment: validated.data.preferredDepartment,
          previousDegree: validated.data.previousDegree,
          previousInstitution: validated.data.previousInstitution,
          previousPassingYear: validated.data.previousPassingYear,
          userId: session.user.id,
          status: StudentApplicationStatus.PENDING,
          attemptNo: prevAttempts ? prevAttempts.attemptNo + 1 : 1,
          semesterId: validated.data.semesterId,
        },
        select: {
          id: true,
        },
      });

      await tx.applicationReview.create({
        data: {
          applicationId: id,
          actorId: session.user.id,
          actorRole: "USER",
          action: "SUBMITTED",
        },
      });

      return id;
    });

    await SendEmail({
      to: session.user.email,
      subject: "Application Submitted Successfully",
      meta: {
        description: `Hi ${session.user.name}, your application has been submitted successfully. Use the link below to track your application progress.`,
        link: getApplicationTrackingLink(applicationId),
      },
    });

    return {
      status: "success",
      message: "Application submitted successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
