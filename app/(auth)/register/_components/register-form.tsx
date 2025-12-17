"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useRouter } from "next/navigation";
import { tryCatch } from "@/hooks/tryCatch";
import { toast } from "sonner";
import { useTransition } from "react";
import { signUp } from "../../actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isEmailPending, startEmailTransition] = useTransition();
  const router = useRouter();

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
      const { data: result, error } = await tryCatch(signUp(values));

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.push("/register/success");
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register to your account</CardTitle>
          <CardDescription>
            Enter your email below to register to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="m@example.com"
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
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      type="password"
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
        </CardContent>
      </Card>
    </div>
  );
}
