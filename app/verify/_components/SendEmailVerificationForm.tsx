"use client";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.email({ message: "Please provide a valid email address" }),
});

export type FormSchemaType = z.infer<typeof formSchema>;

export function SendEmailVerificationForm() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const router = useRouter();

  async function sendVerificationEmailLink({ email }: FormSchemaType) {
    await sendVerificationEmail({
      email,
      callbackURL: "/verify",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Email sent successfully");
          router.push("/verify/success");
        },
      },
    });
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(sendVerificationEmailLink)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  &nbsp;Loading...
                </>
              ) : (
                <>Send Link</>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
