import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { auth } from "./auth";
import { access, roles } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({ ac: access, roles }),
  ],
  baseURL: process.env.BETTER_AUTH_URL,
});

export const {
  signIn,
  signUp,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
} = authClient;

export type ErrorCode = keyof typeof authClient.$ERROR_CODES;
