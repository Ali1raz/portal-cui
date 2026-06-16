"use server";

import { auth } from "@/lib/auth";
import { protect } from "@/lib/arcjet-protect";
import { headers } from "next/headers";
import { requireSession } from "@/app/data/session/require-session";
import { ApiResponseType } from "@/lib/types";
import { updateProfileSchema, UpdateProfileType } from "./schema";

export async function updateProfileAction(
  values: UpdateProfileType,
  currentUserId: string
): Promise<ApiResponseType> {
  const { user } = await requireSession();

  const deniedMessage = await protect(user.id, {
    action: "user:profile:update",
  });
  if (deniedMessage) {
    return {
      status: "error",
      message: deniedMessage,
    };
  }

  try {
    if (user.id !== currentUserId) {
      return {
        status: "error",
        message: "You are not authorized to update this profile",
      };
    }

    const validated = updateProfileSchema.safeParse(values);

    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validated.data.name,
        image: validated.data.imageKey,
      },
    });
    return {
      status: "success",
      message: "Profile Updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update profile",
    };
  }
}
