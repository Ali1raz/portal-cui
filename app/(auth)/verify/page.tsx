import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { SendEmailVerificationForm } from "./_components/SendEmailVerificationForm";
import { redirect } from "next/navigation";

interface iAppProps {
  searchParams: Promise<{ error: string }>;
}

export default async function VerifyEmail({ searchParams }: iAppProps) {
  const { error } = await searchParams;
  if (!error) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full max-w-xl mx-auto">
      <Card className="p-8 w-full">
        <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
        <CardDescription className="text-red-600 dark:text-red-400">
          {error === "invalid_token" || error === "token_expired"
            ? "Your token is invalid or expired. Please require a new one."
            : error === "email_not_verified"
              ? "Email not verified. Please request a verification URL to login."
              : "Opps something went wrong. Please try again."}
        </CardDescription>
        <CardContent className="mx-auto w-full max-w-md">
          <SendEmailVerificationForm />
        </CardContent>
      </Card>
    </div>
  );
}
