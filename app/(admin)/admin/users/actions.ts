"use server";

import { requireSession } from "@/app/data/session/require-session";
import { Role, Department } from "@/lib/generated/prisma/enums";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/app/data/permission/require-permission";
import { Prisma } from "@/lib/generated/prisma/client";
import { protect } from "@/lib/arcjet-protect";
import {
  changeUserRoleSchema,
  type ChangeUserRolePayload,
} from "./user-role-form-schema";

/// Updates a user's role for admin management.

function generateEmployeeNo() {
  // Simple unique employee number — replace with your own sequence logic if needed
  return `EMP-${Date.now()}`;
}

export async function setUserRole(
  userId: string,
  payload: ChangeUserRolePayload
): Promise<ApiResponseType> {
  const session = await requireSession();

  const deniedMessage = await protect(session.user.id);
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

    const parsedPayload = changeUserRoleSchema.safeParse(payload);
    if (!parsedPayload.success) {
      return {
        status: "error",
        message:
          parsedPayload.error.issues[0]?.message ?? "Invalid role payload.",
      };
    }

    const { role, professorDepartment, professorPrograms, hodDepartment } =
      parsedPayload.data;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        professor: {
          select: {
            id: true,
            employeeNo: true,
            department: true,
            programs: true,
          },
        },
        hod: { select: { id: true, department: true } },
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

    const ops: Prisma.PrismaPromise<unknown>[] = [
      prisma.user.update({ where: { id: userId }, data: { role } }),
    ];

    if (role === Role.PROFESSOR) {
      if (!professorDepartment) {
        return {
          status: "error",
          message: "Department is required for professors.",
        };
      }

      if (!professorPrograms?.length) {
        return {
          status: "error",
          message: "Select at least one program for the professor.",
        };
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

      const professorData = {
        department: professorDepartment,
        programs: professorPrograms ?? [],
      };

      if (currentUser.professor) {
        ops.push(
          prisma.professor.upsert({
            where: { userId },
            update: professorData,
            create: {
              userId,
              employeeNo:
                currentUser.professor.employeeNo ?? generateEmployeeNo(),
              ...professorData,
            },
          })
        );
      } else {
        ops.push(
          prisma.professor.create({
            data: {
              userId,
              employeeNo: generateEmployeeNo(),
              ...professorData,
            },
          })
        );
      }
    } else if (role === Role.HOD) {
      if (!hodDepartment) {
        return {
          status: "error",
          message: "Department is required for HODs.",
        };
      }

      if (currentUser.professor) {
        ops.push(prisma.professor.delete({ where: { userId } }));
      }
      if (currentUser.accountant) {
        ops.push(prisma.accountant.delete({ where: { userId } }));
      }
      if (currentUser.director) {
        ops.push(prisma.director.delete({ where: { userId } }));
      }

      const hodData = {
        department: hodDepartment,
      };

      if (currentUser.hod) {
        ops.push(
          prisma.hod.upsert({
            where: { userId },
            update: hodData,
            create: {
              userId,
              ...hodData,
            },
          })
        );
      } else {
        ops.push(
          prisma.hod.create({
            data: {
              userId,
              ...hodData,
            },
          })
        );
      }
    } else if (role === Role.ACCOUNTANT) {
      if (currentUser.professor) {
        ops.push(prisma.professor.delete({ where: { userId } }));
      }
      if (currentUser.hod) {
        ops.push(prisma.hod.delete({ where: { userId } }));
      }
      if (currentUser.director) {
        ops.push(prisma.director.delete({ where: { userId } }));
      }

      ops.push(
        prisma.accountant.upsert({
          where: { userId },
          update: {},
          create: { userId },
        })
      );
    } else if (role === Role.DIRECTOR) {
      if (currentUser.professor) {
        ops.push(prisma.professor.delete({ where: { userId } }));
      }
      if (currentUser.hod) {
        ops.push(prisma.hod.delete({ where: { userId } }));
      }
      if (currentUser.accountant) {
        ops.push(prisma.accountant.delete({ where: { userId } }));
      }

      ops.push(
        prisma.director.upsert({
          where: { userId },
          update: {},
          create: { userId },
        })
      );
    } else if (role === Role.USER) {
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
    } else {
      return {
        status: "error",
        message:
          "Batch Advisor and Student roles are managed through dedicated flows.",
      };
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

  const deniedMessage = await protect(session.user.id);
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

  const deniedMessage = await protect(session.user.id);
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
