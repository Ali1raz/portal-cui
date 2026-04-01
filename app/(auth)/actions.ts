"use server";

import { auth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import { z } from "zod";

const emailSchema = z.email({ message: "Not a valid email." });

/// Sends a password-reset link to the given email address.
/// Returns `success` when the link is dispatched; `error` on validation failure
/// or if Better Auth throws.
export async function forgotPassword(email: string): Promise<ApiResponseType> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data, redirectTo: "/reset-password" },
    });

    return {
      status: "success",
      message: "Password reset link sent to your email.",
    };
  } catch (error: unknown) {
    return { status: "error", message: errorMessage(error) };
  }
}
