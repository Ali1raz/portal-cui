"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { registerSchema, RegisterSchemaType } from "@/lib/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { tryCatch } from "@/hooks/tryCatch";
import { toast } from "sonner";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Route } from "next";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "../../../../components/general/password-input";

/// Register form with account creation and redirect to success page.
export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isEmailPending, startEmailTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get the original route where user came from
  const callbackUrl = searchParams.get("from");

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: RegisterSchemaType) {
    startEmailTransition(async () => {
      const { error } = await tryCatch(
        authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
          image: `https://avatar.vercel.sh/${values.email.split("@")[0]}`,
          fetchOptions: {
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
            onSuccess: () => {
              toast.success(
                "Registeration successful! Please check your email for verification link."
              );
            },
          },
        })
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      const successUrl = `/register/success?email=${encodeURIComponent(values.email)}${
        callbackUrl ? `&from=${encodeURIComponent(callbackUrl)}` : ""
      }`;

      router.push(successUrl as Route);
    });
  }

  return (
    <div className={cn("", className)} {...props}>
      <div className="grid gap-4">
        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid && fieldState.isTouched}
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
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
          <Button disabled={isEmailPending} type="submit" form="register-form">
            {isEmailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>Register</>
            )}
          </Button>
        </Field>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline underline-offset-4"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
