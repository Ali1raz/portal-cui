import { ForgotPasswordForm } from "./_components/forgot-password-form/page";
import { CUILogo } from "@/components/general/cui-logo";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <CUILogo
          className="flex items-center text-center mb-8 flex-col gap-y-2"
          imageClasses="size-26"
        />
        <div className="space-y-2 my-4">
          <h2 className="text-2xl font-bold">Forgot your password?</h2>
          <p className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
