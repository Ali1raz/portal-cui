import { LoginForm } from "./_components/login-form";
import { redirect } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";
import { requireSession } from "@/app/data/session/require-session";

export default async function Page() {
  const data = await requireSession();

  if (data.user.role === Role.DIRECTOR) {
    return redirect("/director");
  } else if (data.user.role === Role.STUDENT) {
    return redirect("/student");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl">
        <LoginForm />
      </div>
    </div>
  );
}
