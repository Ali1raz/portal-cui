import { auth } from "@/lib/auth";
import { RegisterForm } from "./_components/register-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";

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
        <RegisterForm />
      </div>
    </div>
  );
}
