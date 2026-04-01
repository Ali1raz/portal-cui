import { redirect } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDashboardRedirectPath } from "@/lib/get-dashboard-redirect-path";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (data?.user) {
    return redirect(
      getDashboardRedirectPath(data?.user?.role as Role | undefined)
    );
  }

  return <main className="flex flex-col max-w-5xl mx-auto">{children}</main>;
}
