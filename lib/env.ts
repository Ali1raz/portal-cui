import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.preprocess((value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      const withoutWrappingQuotes = trimmed.replace(/^['\"]|['\"]$/g, "");
      return withoutWrappingQuotes;
    }, z.url()),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    DIRECTOR_EMAILS: z.string().min(1),
    ADMIN_EMAILS: z.string().min(1),
    NODEMAILER_USER: z.email(),
    NODEMAILER_APP_PASSWORD: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_ENDPOINT_URL_S3: z.url(),
    AWS_ENDPOINT_URL_IAM: z.url(),
    AWS_REGION: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    ARCJET_ENV: z.enum(["development", "production"]).default("development"),
  },
  //   clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_S3_BUCKET_NAME: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  },
  //   runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
