"use server";

import { auth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";
import { registerSchema, RegisterSchemaType } from "@/lib/schema";
import { ApiResponseType } from "@/lib/types";

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
