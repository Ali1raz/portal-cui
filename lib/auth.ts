import { SendEmail } from "@/app/actions/send-email";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Role } from "./generated/prisma/enums";
import prisma from "./prisma";

import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await SendEmail({
        to: user.email,
        subject: "Reset password",
        meta: {
          description: "Click this link to reset your password:",
          link: url,
        },
      });
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: Role.USER,
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 5,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/");

      await SendEmail({
        to: user.email,
        subject: "Verify your email address",
        meta: {
          description: "Please verify your email for registration.",
          link: String(link),
        },
      });
    },
  },

  plugins: [
    admin({
      adminRoles: [Role.DIRECTOR, Role.ADMIN, Role.DIRECTOR],
    }),
    nextCookies(),
  ],
});

export type User = typeof auth.$Infer.Session.user;
