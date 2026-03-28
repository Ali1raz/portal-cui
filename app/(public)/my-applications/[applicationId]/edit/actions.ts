"use server";

import { requireSession } from "@/app/data/session/require-session";
import { requirePermission } from "@/app/data/permission/require-permission";
import { errorMessage } from "@/lib/error-message";
import {
  ApplicationAction,
  StudentApplicationStatus,
} from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import {
  updateMyApplicationPayloadSchema,
  type UpdateMyApplicationInput,
} from "./schemas";
import { MY_APPLICATION_EDITABLE_STATUSES } from "../../my-application-constants";

function mapResubmittedStatus(
  currentStatus: StudentApplicationStatus
): StudentApplicationStatus {
  if (
    currentStatus === StudentApplicationStatus.REVIEW_REQUESTED ||
    currentStatus === StudentApplicationStatus.REJECTED
  ) {
    return StudentApplicationStatus.PENDING;
  }

  return currentStatus;
}

export async function updateMyApplication(
  applicationId: string,
  values: UpdateMyApplicationInput
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();
    const can = await requirePermission({ applications: ["update:own"] });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update your application.",
      };
    }

    const parsed = updateMyApplicationPayloadSchema.safeParse({
      applicationId,
      values,
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: "Invalid application data.",
      };
    }

    const application = await prisma.studentApplication.findFirst({
      where: {
        id: parsed.data.applicationId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!application) {
      return {
        status: "error",
        message: "Application not found.",
      };
    }

    if (!MY_APPLICATION_EDITABLE_STATUSES.includes(application.status)) {
      return {
        status: "error",
        message: "This application cannot be edited anymore.",
      };
    }

    const nextStatus = mapResubmittedStatus(application.status);

    await prisma.$transaction([
      prisma.studentApplication.update({
        where: { id: application.id },
        data: {
          fullName: parsed.data.values.fullName,
          dateOfBirth: parsed.data.values.dateOfBirth,
          gender: parsed.data.values.gender,
          address: parsed.data.values.address,
          city: parsed.data.values.city,
          phoneNo: parsed.data.values.phoneNo,
          previousDegree: parsed.data.values.previousDegree,
          previousInstitution: parsed.data.values.previousInstitution,
          previousPassingYear: parsed.data.values.previousPassingYear,
          percentage: parsed.data.values.previousPercentage,
          preferredDepartment: parsed.data.values.preferredDepartment,
          status: nextStatus,
        },
      }),
      prisma.applicationReview.create({
        data: {
          applicationId: application.id,
          actorRole: "USER",
          actorId: session.user.id,
          action: ApplicationAction.RESUBMITTED,
          remarks: "Application updated by student",
          fromStatus: application.status,
          toStatus: nextStatus,
        },
      }),
    ]);

    return {
      status: "success",
      message:
        nextStatus === StudentApplicationStatus.PENDING
          ? "Application updated and resubmitted successfully."
          : "Application updated successfully.",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
