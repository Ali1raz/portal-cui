"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/tryCatch";
import { loginSchema, LoginSchemaType } from "@/lib/schema";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authClient, signIn } from "@/lib/auth-client";
import { Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { Role } from "@/lib/generated/prisma/enums";
import { useRouter, useSearchParams } from "next/navigation";
import { getDashboardRedirectPath } from "@/lib/get-dashboard-redirect-path";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Route } from "next";
import { PasswordInput } from "../../../../components/general/password-input";

/// Login form with session refresh after successful auth.
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isEmailPending, startEmailTransition] = useTransition();
  const [hintVisible, setHintVisible] = useState(false);
  const [hintEmail, setHintEmail] = useState("");
  const searchParams = useSearchParams();

  const router = useRouter();

  // Get the full callback URL with search params preserved
  const callbackUrl = searchParams.get("from");

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginSchemaType) {
    startEmailTransition(async () => {
      const { data: signInResult, error } = await tryCatch(
        signIn.email({
          email: values.email,
          password: values.password,
        })
      );

      if (error || signInResult?.error) {
        toast.error(signInResult?.error?.message ?? "Invalid credentials");
        const errorCode = signInResult?.error?.code;
        if (errorCode === "EMAIL_NOT_VERIFIED") {
          setHintVisible(true);
          setHintEmail(values.email);
        }
        return;
      }

      setHintVisible(false);
      toast.success("Login successful");

      const refreshed = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      const role = refreshed?.data?.user?.role as Role | undefined;
      const redirectUrl = callbackUrl || getDashboardRedirectPath(role);
      router.push(redirectUrl as Route);
    });
  }

  return (
    <div className={cn("", className)} {...props}>
      <div className="grid gap-4">
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="m@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Field className="mt-4">
          <Button disabled={isEmailPending} type="submit" form="login-form">
            {isEmailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>Login</>
            )}
          </Button>
        </Field>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={
              `/register${callbackUrl ? `?from=${encodeURIComponent(callbackUrl)}` : ""}` as Route
            }
            className="text-primary hover:underline underline-offset-4"
          >
            Register
          </Link>
        </div>

        {hintVisible && (
          <Card className="mt-6 border rounded">
            <CardHeader>
              <CardAction>
                <Info className="size-8 text-primary animate-pulse" />
              </CardAction>
              <CardTitle className="text-xl">
                Your email is not verified.
              </CardTitle>
              <CardDescription>
                Please request a new verification email from{" "}
                <Link
                  href={`/verify?error=email_not_verified${
                    hintEmail ? `&email=${encodeURIComponent(hintEmail)}` : ""
                  }`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  verify email
                </Link>{" "}
                and then sign in again.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
