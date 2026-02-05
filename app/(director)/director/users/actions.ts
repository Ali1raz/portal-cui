"use server";

import { requireSession } from "@/app/data/session/require-session";
import { Role } from "@/lib/generated/prisma/enums";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/app/data/permission/require-permission";

export async function setUserRole(
  userId: string,
  role: Role
): Promise<ApiResponseType> {
  await requireSession();

  try {
    const can = await requirePermission({
      user: ["set-role"],
    });

    if (!can) {
      return {
        status: "error",
        message: "You are not allowed to set-role",
      };
    }

    // Do role change + sequential ID assignment in a single transaction
    await prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });

    // Assign IDs if needed
    // Future

    return { status: "success", message: "Successfully Changed User role." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
