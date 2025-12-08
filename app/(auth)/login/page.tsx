import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/login-form";
import { redirect } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";
import { headers } from "next/headers";

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
      <div className="w-full max-w-xl">
        <LoginForm />
      </div>
    </div>
  );
}
