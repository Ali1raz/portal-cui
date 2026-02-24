import { CUILogo } from "@/components/general/cui-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <CUILogo
          className="flex items-center text-center mb-8 flex-col gap-y-2"
          imageClasses="size-26"
        />
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We&apos;ve sent you a password reset link. Click the link in the
              email to create a new password.
            </p>
          </div>
          <Button asChild variant="link">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
