import { SendEmail } from "@/app/actions/send-email";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Role } from "./generated/prisma/enums";
import prisma from "./prisma";

import { admin, username } from "better-auth/plugins";
import { roles } from "./permissions";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: [
      env.BETTER_AUTH_URL,
      "*.vercel.app", // All Vercel previews
      "localhost:*", // Local development all ports
    ],
    fallback: "localhost:3000",
    protocol: env.NODE_ENV === "development" ? "http" : "https",
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    passwordResetExpiresIn: 60 * 15,
    sendResetPassword: async ({ user, url }) => {
      if (env.NODE_ENV !== "production") {
        // Log full email payload for debugging in development
        console.log("[DEV PASSWORD RESET]", { to: user.email, url });
        return;
      }
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
      link.searchParams.set("from", "/");

      if (env.NODE_ENV === "production") {
        await SendEmail({
          to: user.email,
          subject: "Verify your email address",
          meta: {
            description: "Please verify your email for registration.",
            link: String(link),
          },
        });
        return;
      }
      // Log full email payload for debugging in development
      console.log("[DEV EMAIL VERIFICATION]", {
        to: user.email,
        link: link.toString(),
      });
    },

    afterEmailVerification: async (user) => {
      const DIRECTOR_EMAILS: string[] = env.DIRECTOR_EMAILS.split(";");
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
      const ADMIN_EMAILS: string[] = env.ADMIN_EMAILS.split(";");
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
    username({
      usernameValidator: (username) => {
        // Accept registration numbers: SP25-BSE-001, FA24-BCS-012, etc.
        return /^[a-zA-Z0-9_-]+$/.test(username);
      },
      displayUsernameValidator: (displayUsername) => {
        // Allow only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(displayUsername);
      },
    }),
    admin({
      defaultRole: Role.USER,
      roles,
      adminRoles: [Role.ADMIN, Role.DIRECTOR],
    }),
    nextCookies(),
  ],
});

export type User = typeof auth.$Infer.Session.user;
