import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./_components/reset-password-form";
import { CUILogo } from "@/components/general/cui-logo";

interface iAppProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ searchParams }: iAppProps) {
  const { token } = await searchParams;
  if (!token) redirect("/login");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <CUILogo
          className="flex items-center text-center mb-8 flex-col gap-y-2"
          imageClasses="size-26"
        />
        <div className="space-y-2 my-4">
          <h2 className="text-2xl font-bold">Reset your password</h2>
          <p className="text-muted-foreground">
            Enter your new password below to reset your password
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
