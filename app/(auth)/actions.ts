"use server";

import { auth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";
import {
  loginSchema,
  LoginSchemaType,
  registerSchema,
  RegisterSchemaType,
} from "@/lib/schema";
import { ApiResponseType } from "@/lib/types";
import { z } from "zod";

const emailSchema = z.string().email({ message: "Not a valid email." });

export async function signUp(
  values: RegisterSchemaType
): Promise<ApiResponseType> {
  try {
    const validated = registerSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await auth.api.signUpEmail({
      body: {
        name: values.name,
        email: values.email,
        password: values.password,
      },
    });

    return {
      status: "success",
      message: "Signup successful",
    };
  } catch (error: unknown) {
    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}

/// Signs in a user with email and password via Better Auth.
/// Returns `success` with the authenticated user's `role`; `error` on
/// validation failure or if Better Auth rejects the credentials.
export async function signIn(
  values: LoginSchemaType
): Promise<ApiResponseType & { role?: string }> {
  const validated = loginSchema.safeParse(values);
  if (!validated.success) {
    return { status: "error", message: "Invalid form data" };
  }

  try {
    const result = await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
    });

    return {
      status: "success",
      message: "Login successful",
      role: (result?.user as { role?: string } | undefined)?.role,
    };
  } catch (error: unknown) {
    return { status: "error", message: errorMessage(error) };
  }
}

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
