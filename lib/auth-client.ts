import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
} = authClient;

export type ErrorCode = keyof typeof authClient.$ERROR_CODES;
