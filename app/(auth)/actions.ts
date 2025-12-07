"use server";

import { auth } from "@/lib/auth";
import { ErrorCode } from "@/lib/auth-client";
import { errorMessage } from "@/lib/error-message";
import {
  loginSchema,
  LoginSchemaType,
  registerSchema,
  RegisterSchemaType,
} from "@/lib/schema";
import { ApiResponseType } from "@/lib/types";
import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
      headers: await headers(),
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

export async function login(values: LoginSchemaType): Promise<ApiResponseType> {
  try {
    const validated = loginSchema.safeParse(values);
    if (!validated.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await auth.api.signInEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
      },
      headers: await headers(),
    });

    return {
      status: "success",
      message: "Login successful",
    };
  } catch (error: unknown) {
    if (error instanceof APIError) {
      const errorCode = error.body
        ? (error.body?.code as ErrorCode)
        : "UNDEFINED";

      switch (errorCode) {
        case "EMAIL_NOT_VERIFIED":
          redirect("/verify?error=email_not_verified");
        default:
          return {
            status: "error",
            message: errorMessage(error),
          };
      }
    }

    return {
      status: "error",
      message: errorMessage(error),
    };
  }
}
