import { SendEmailVerificationForm } from "./_components/SendEmailVerificationForm";
import { redirect } from "next/navigation";
import { CUILogo } from "@/components/general/cui-logo";

interface iAppProps {
  searchParams: Promise<{ error: string }>;
}

export default async function VerifyEmail({ searchParams }: iAppProps) {
  const { error } = await searchParams;
  if (!error) {
    redirect("/");
  }

  const errorMessage =
    error === "invalid_token" || error === "token_expired"
      ? "Your token is invalid or expired. Please request a new one."
      : error === "email_not_verified"
        ? "Email not verified. Please request a verification URL to login."
        : "Oops! Something went wrong. Please try again.";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <CUILogo
          className="flex items-center text-center mb-8 flex-col gap-y-2"
          imageClasses="size-26"
        />
        <div className="space-y-2 my-4">
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
        <SendEmailVerificationForm />
      </div>
    </div>
  );
}
