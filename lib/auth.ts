import { SendEmail } from "@/app/actions/send-email";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Role } from "./generated/prisma/enums";
import prisma from "./prisma";

import { admin } from "better-auth/plugins";
import { roles } from "./permissions";
import { getBaseURL } from "./base-path";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: getBaseURL(),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === "production",
    autoSignIn: true,
    passwordResetExpiresIn: 60 * 15,
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
    sendOnSignUp: process.env.NODE_ENV === "production",
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

    afterEmailVerification: async (user) => {
      const DIRECTOR_EMAILS: string[] =
        process.env.DIRECTOR_EMAILS?.split(";") ?? [];
      if (DIRECTOR_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.DIRECTOR },
        });

        await SendEmail({
          to: user.email,
          subject: "You're now a Director!",
          meta: {
            description: `Your email is verified and you've been granted Director access.`,
          },
        });

        return;
      }
      const ADMIN_EMAILS: string[] = process.env.ADMIN_EMAILS?.split(";") ?? [];
      if (ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN },
        });

        await SendEmail({
          to: user.email,
          subject: "You're now an Admin!",
          meta: {
            description: `Your email is verified and you've been granted ADMIN access.`,
          },
        });

        return;
      }
    },
  },

  plugins: [
    admin({
      defaultRole: Role.USER,
      roles,
      adminRoles: [Role.ADMIN, Role.DIRECTOR],
    }),
    nextCookies(),
  ],
});

export type User = typeof auth.$Infer.Session.user;
