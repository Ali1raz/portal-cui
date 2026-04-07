"use server";

import { requireSession } from "@/app/data/session/require-session";
import { requirePermission } from "@/app/data/permission/require-permission";
import { getStudentRegistrationSeqCount } from "@/app/data/clerk/get-student-registration-seq-count";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { Batch, Department, Program } from "@/lib/generated/prisma/enums";
import {
  clerkBulkUpdateApplicationStatusSchema,
  type ClerkBulkUpdateApplicationStatusInput,
  clerkUpdateApplicationStatusSchema,
  type ClerkUpdateApplicationStatusInput,
} from "./schemas";
import { CLERK_APPLICATION_REVIEWABLE_STATUSES } from "@/lib/data/utils";
import { SendEmail } from "@/app/actions/send-email";
import { env } from "@/lib/env";

function generateRegNumber({
  batch,
  year,
  program,
  department,
  seq,
}: {
  batch: Batch;
  year: number;
  program: Program;
  department: Department;
  seq: number;
}) {
  const yearTwoDigits = String(year).slice(-2);
  const formattedSeq = String(seq).padStart(3, "0");

  return `${batch}${yearTwoDigits}-${program}${department}-${formattedSeq}`;
}

function getSignInLink() {
  const appBaseUrl = env.BETTER_AUTH_URL || "localhost:3000";

  if (!appBaseUrl) {
    return "/login";
  }

  return `${appBaseUrl.replace(/\/$/, "")}/login`;
}

function getApplicationTrackingLink(applicationId: string) {
  const appBaseUrl = env.BETTER_AUTH_URL || "localhost:3000";

  if (!appBaseUrl) {
    return `/my-applications/${applicationId}`;
  }

  return `${appBaseUrl.replace(/\/$/, "")}/my-applications/${applicationId}`;
}

export async function clerkUpdateApplicationStatus(
  data: ClerkUpdateApplicationStatusInput
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();
    const can = await requirePermission({ applications: ["update"] });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update applications.",
      };
    }

    const { data: parsed, success } =
      clerkUpdateApplicationStatusSchema.safeParse(data);

    if (!success) {
      return {
        status: "error",
        message: "Invalid input.",
      };
    }

    const application = await prisma.studentApplication.findUnique({
      where: {
        id: parsed.applicationId,
      },
      select: {
        id: true,
        status: true,
        semesterId: true,
        userId: true,
        preferredDepartment: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!application) {
      return {
        status: "error",
        message: "Application not found.",
      };
    }

    if (!application.semesterId) {
      return {
        status: "error",
        message: "Associated semester not found.",
      };
    }

    const seme = await prisma.semester.findUnique({
      where: { id: application.semesterId },
      select: {
        year: true,
        batch: true,
      },
    });

    if (!seme) {
      return {
        status: "error",
        message: "Associated semester not found.",
      };
    }

    if (!CLERK_APPLICATION_REVIEWABLE_STATUSES.includes(application.status)) {
      return {
        status: "error",
        message: "This application has already been reviewed.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentApplication.update({
        where: { id: parsed.applicationId },
        data: {
          status: parsed.status,
        },
      });

      if (parsed.status === "APPROVED") {
        await tx.user.update({
          where: {
            id: application.userId,
          },
          data: {
            role: "STUDENT",
          },
        });

        const program: Program = "B"; // hard coded because currently only BS programs
        const seq = await getStudentRegistrationSeqCount({
          batch: seme.batch,
          year: seme.year,
          department: application.preferredDepartment,
        });
        const registrationNo = generateRegNumber({
          batch: seme.batch,
          year: seme.year,
          program,
          department: application.preferredDepartment,
          seq,
        });

        const existingStudent = await tx.student.findUnique({
          where: {
            userId: application.userId,
          },
          select: {
            id: true,
          },
        });

        const effectiveStudent = existingStudent
          ? existingStudent
          : await tx.student.create({
              data: {
                department: application.preferredDepartment,
                program,
                registrationNo,
                user: {
                  connect: {
                    id: application.userId,
                  },
                },
              },
              select: {
                id: true,
              },
            });

        // console.log("-=-=---=>", effectiveStudent.id);

        await tx.registration.upsert({
          where: {
            userId: application.userId,
          },
          update: {
            studentId: effectiveStudent.id,
            semesterId: application.semesterId,
            status: "APPROVED",
          },
          create: {
            userId: application.userId,
            studentId: effectiveStudent.id,
            semesterId: application.semesterId,
            status: "APPROVED",
          },
        });
      }

      await tx.applicationReview.create({
        data: {
          applicationId: parsed.applicationId,
          actorRole: "CLERK",
          actorId: session.user.id,
          action:
            parsed.status === "APPROVED"
              ? "CLERK_APPROVED"
              : parsed.status === "REJECTED"
                ? "CLERK_REJECTED"
                : "CLERK_REVIEW_REQUESTED",
          remarks: parsed.remarks,
          fromStatus: application.status,
          toStatus: parsed.status,
        },
      });
    });

    if (parsed.status === "APPROVED") {
      await SendEmail({
        to: application.user.email,
        subject: "Your Registration Application Is Approved",
        meta: {
          description: `Congrats ${application.user.name}, your registration application is approved.`,
          link: getSignInLink(),
        },
      });
    }

    if (parsed.status === "REVIEW_REQUESTED") {
      const remarksDescription = parsed.remarks?.trim().length
        ? `Details: ${parsed.remarks.trim()}`
        : "Details: Please review your submitted details and update missing information.";

      await SendEmail({
        to: application.user.email,
        subject: "Update requested for Your Application",
        meta: {
          description: `Hi ${application.user.name}, more information is required for your registration application. ${remarksDescription} Open your application page to track progress and update details.`,
          link: getApplicationTrackingLink(application.id),
        },
      });
    }

    return {
      status: "success",
      message:
        parsed.status === "APPROVED"
          ? "Application approved successfully."
          : parsed.status === "REVIEW_REQUESTED"
            ? "Student has been asked to provide more information."
            : "Application rejected successfully.",
    };
  } catch (error: unknown) {
    // console.log(error);
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

export async function clerkBulkUpdateApplicationStatus(
  data: ClerkBulkUpdateApplicationStatusInput
): Promise<ApiResponseType> {
  try {
    await requireSession();
    const can = await requirePermission({ applications: ["update"] });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to update applications.",
      };
    }

    const { data: parsed, success } =
      clerkBulkUpdateApplicationStatusSchema.safeParse(data);

    if (!success) {
      return {
        status: "error",
        message: "Invalid input.",
      };
    }

    const uniqueApplicationIds = Array.from(new Set(parsed.applicationIds));

    if (uniqueApplicationIds.length === 0) {
      return {
        status: "error",
        message: "No applications selected.",
      };
    }

    let successCount = 0;
    let failedCount = 0;
    let firstErrorMessage = "";

    for (const applicationId of uniqueApplicationIds) {
      const result = await clerkUpdateApplicationStatus({
        applicationId,
        status: parsed.status,
        remarks: parsed.remarks,
      });

      if (result.status === "success") {
        successCount += 1;
      } else {
        failedCount += 1;
        if (!firstErrorMessage) {
          firstErrorMessage = result.message;
        }
      }
    }

    if (successCount === 0) {
      return {
        status: "error",
        message: firstErrorMessage || "No applications were updated.",
      };
    }

    if (failedCount > 0) {
      return {
        status: "success",
        message: `Updated ${successCount} ${successCount === 1 ? "application" : "applications"}. ${failedCount} ${failedCount === 1 ? "application was" : "applications were"} skipped.`,
      };
    }

    return {
      status: "success",
      message: `Successfully updated ${successCount} ${successCount === 1 ? "application" : "applications"}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
