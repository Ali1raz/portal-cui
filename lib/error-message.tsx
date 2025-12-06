import { APIError } from "better-auth/api";

export function errorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return ` ${error.status} - ${error.body?.message}`;
  }

  return "Something went wrong!";
}
