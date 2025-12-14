"use server";

import { requireSession } from "@/app/data/session/require-session";
import { Role } from "@/lib/generated/prisma/enums";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import prisma from "@/lib/prisma";

export async function setUserRole(
  userId: string,
  role: Role
): Promise<ApiResponseType> {
  await requireSession();

  try {
    // Check permissions (if throws, will be caught below)
    // future

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
