import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { APIError } from "better-auth/api";

export function errorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return ` ${error.status} - ${error.body?.message}`;
  } else if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    console.log(error.name);
    return "Resource not found";
  }

  return "Something went wrong!";
}
