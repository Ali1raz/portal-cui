import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/login-form";
import { redirect } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";
import { headers } from "next/headers";
import { CUILogo } from "@/components/general/cui-logo";

export default async function Page() {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (data?.session && data?.user.role === Role.DIRECTOR) {
    return redirect("/director");
  } else if (data?.session) {
    return redirect("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <CUILogo
          className="flex items-center text-center mb-8 flex-col gap-y-2"
          imageClasses="size-26"
        />
        <div className="space-y-2 my-4">
          <h2 className="text-2xl font-bold">Login to your account</h2>
          <p className="text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
