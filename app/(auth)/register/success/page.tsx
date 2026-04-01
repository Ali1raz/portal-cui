import { CUILogo } from "@/components/general/cui-logo";
import { OpenEmailLink } from "../../_components/open-email-link";

export default async function VerifyEmail(
  props: PageProps<"/register/success">
) {
  const searchParams = await props.searchParams;
  const userEmail =
    typeof searchParams.email === "string" ? searchParams.email : undefined;

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
            <p className="text-muted-foreground">
              We&apos;ve sent you a verification link. Click the link in the
              email to verify your account and complete your registration.
            </p>
            {userEmail?.includes("gmail.com") && (
              <OpenEmailLink userEmail={userEmail} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
