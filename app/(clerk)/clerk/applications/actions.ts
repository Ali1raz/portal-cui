"use server";

import { requireSession } from "@/app/data/session/require-session";
import { getStudentRegistrationSeqCount } from "@/app/data/clerk/get-student-registration-seq-count";
import { errorMessage } from "@/lib/error-message";
import prisma from "@/lib/prisma";
import { ApiResponseType } from "@/lib/types";
import { Batch, Department, Program } from "@/lib/generated/prisma/enums";
import {
  clerkUpdateApplicationStatusSchema,
  type ClerkUpdateApplicationStatusInput,
} from "./schemas";
import { CLERK_APPLICATION_REVIEWABLE_STATUSES } from "@/lib/data/utils";

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

export async function clerkUpdateApplicationStatus(
  data: ClerkUpdateApplicationStatusInput
): Promise<ApiResponseType> {
  try {
    const session = await requireSession();

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

        const createdStudent = await tx.student.create({
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

        await tx.registration.create({
          data: {
            userId: application.userId,
            studentId: createdStudent.id,
            semesterId: application.semesterId,
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
    console.log(error);
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
