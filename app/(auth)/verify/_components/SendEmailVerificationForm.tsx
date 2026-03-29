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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.email({ message: "Please provide a valid email address" }),
});

export type FormSchemaType = z.infer<typeof formSchema>;

/// Email verification form that sends verification link to user's email.
export function SendEmailVerificationForm({
  initialEmail,
  className,
  ...props
}: React.ComponentProps<"div"> & { initialEmail?: string }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail ?? "",
    },
  });

  const router = useRouter();

  function onSubmit(values: FormSchemaType) {
    startTransition(async () => {
      await sendVerificationEmail({
        email: values.email,
        callbackURL: "/verify",
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Email sent successfully");
            router.push(
              `/verify/success?email=${encodeURIComponent(values.email)}`
            );
          },
        },
      });
    });
  }

  return (
    <div className={cn("", className)} {...props}>
      <div className="grid gap-4">
        <form id="verify-email-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                    disabled={isPending}
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
          <Button disabled={isPending} type="submit" form="verify-email-form">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>Send verification link</>
            )}
          </Button>
        </Field>
      </div>
    </div>
  );
}
