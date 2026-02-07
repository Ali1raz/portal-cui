"use server";

import { requireSession } from "@/app/data/session/require-session";
import { Role } from "@/lib/generated/prisma/enums";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/app/data/permission/require-permission";

/// Updates a user's role for admin management.
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

    await prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });

    return { status: "success", message: "Successfully Changed User role." };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
