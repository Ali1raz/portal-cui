"use server";

import { requireSession } from "@/app/data/session/require-session";
import { Role, Department } from "@/lib/generated/prisma/enums";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/app/data/permission/require-permission";
import { Prisma } from "@/lib/generated/prisma/client";
import { getArcjetDeniedMessage } from "@/lib/arcjet-protect";

/// Updates a user's role for admin management.

function generateEmployeeNo() {
  // Simple unique employee number — replace with your own sequence logic if needed
  return `EMP-${Date.now()}`;
}

export async function setUserRole(
  userId: string,
  role: Role
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
    const can = await requirePermission({ user: ["set-role"] });
    if (!can) {
      return { status: "error", message: "You are not allowed to set-role." };
    }

    if (role === Role.BATCH_ADVISOR) {
      return {
        status: "error",
        message:
          "Batch Advisor must be appointed through the BA management page.",
      };
    }

    if (role === Role.STUDENT) {
      return {
        status: "error",
        message:
          "Student accounts must be created through the student registration/admission process.",
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        professor: { select: { id: true } },
        hod: { select: { id: true } },
        accountant: { select: { id: true } },
        director: { select: { id: true } },
        batchAdvisor: { select: { id: true, department: true } },
      },
    });

    if (!currentUser) {
      return { status: "error", message: "User not found." };
    }

    if (currentUser.role === role) {
      return { status: "error", message: "User already has this role." };
    }

    if (currentUser.role === Role.BATCH_ADVISOR && currentUser.batchAdvisor) {
      return {
        status: "error",
        message: `This user is the Batch Advisor for ${currentUser.batchAdvisor.department}. Remove their BA appointment first.`,
      };
    }

    // Typed as PrismaPromise<unknown>[] — no any needed, transaction accepts this
    const ops: Prisma.PrismaPromise<unknown>[] = [
      prisma.user.update({ where: { id: userId }, data: { role } }),
    ];

    // Delete old profile record
    if (currentUser.professor) {
      ops.push(prisma.professor.delete({ where: { userId } }));
    }
    if (currentUser.hod) {
      ops.push(prisma.hod.delete({ where: { userId } }));
    }
    if (currentUser.accountant) {
      ops.push(prisma.accountant.delete({ where: { userId } }));
    }
    if (currentUser.director) {
      ops.push(prisma.director.delete({ where: { userId } }));
    }

    // Create new profile record
    if (role === Role.PROFESSOR) {
      ops.push(
        prisma.professor.create({
          data: {
            userId,
            employeeNo: generateEmployeeNo(),
          },
        })
      );
    }

    if (role === Role.ACCOUNTANT) {
      ops.push(prisma.accountant.create({ data: { userId } }));
    }

    if (role === Role.DIRECTOR) {
      ops.push(prisma.director.create({ data: { userId } }));
    }

    await prisma.$transaction(ops);

    return { status: "success", message: "User role updated successfully." };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { status: "error", message: errorMessage(error) };
  }
}

export async function setProfessorDepartment(
  userId: string,
  department: Department
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
    const can = await requirePermission({ user: ["set-role"] });
    if (!can) {
      return { status: "error", message: "You are not allowed to do this." };
    }

    const professor = await prisma.professor.findUnique({
      where: { userId },
      select: {
        department: true,
        batchAdvisor: { select: { department: true } },
      },
    });

    if (!professor) {
      return { status: "error", message: "User is not a professor." };
    }

    // Changing dept while BA would desync Professor.department from
    // BatchAdvisor.department — complaints would route to wrong person
    if (professor.batchAdvisor) {
      return {
        status: "error",
        message: `Cannot change department while this professor is the Batch Advisor for ${professor.batchAdvisor.department}. Remove BA appointment first.`,
      };
    }

    if (professor.department === department) {
      return {
        status: "error",
        message: "Professor is already in this department.",
      };
    }

    await prisma.professor.update({
      where: { userId },
      data: { department },
    });

    return { status: "success", message: "Department updated successfully." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

/// Appoints a professor as Batch Advisor for their department
export async function makeProfessorBatchAdvisor(
  userId: string
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
    // 1. Fetch professor
    const professor = await prisma.professor.findUnique({
      where: { userId },
      include: { batchAdvisor: true },
    });
    if (!professor) {
      return { status: "error", message: "Professor not found." };
    }
    // 2. Check if professor is already a BA
    if (professor.batchAdvisor) {
      return {
        status: "error",
        message: "Professor is already a Batch Advisor.",
      };
    }

    if (!professor.department) {
      return {
        status: "error",
        message:
          "Professor must have a department before becoming a Batch Advisor.",
      };
    }
    // 3. Check if department already has a BA
    const existingBA = await prisma.batchAdvisor.findFirst({
      where: { department: professor.department },
    });
    if (existingBA) {
      return {
        status: "error",
        message: "This department already has a Batch Advisor.",
      };
    }
    // 4. Atomic transaction
    await prisma.$transaction([
      prisma.batchAdvisor.create({
        data: {
          userId,
          department: professor.department,
          professorId: professor.id,
        },
      }),
      prisma.professor.update({
        where: { userId },
        data: {
          batchAdvisor: {
            connect: { userId },
          },
        },
      }),
    ]);
    return {
      status: "success",
      message: "Professor appointed as Batch Advisor.",
    };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
