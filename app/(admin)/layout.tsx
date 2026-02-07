import { Role } from "@/lib/generated/prisma/enums";
import { requireSession } from "../data/session/require-session";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (session.user.role !== Role.ADMIN) {
    return redirect("/unauthorized");
  }

  return (
    <main>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 60)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={session.user} />
        <SidebarInset>
          <SiteHeader user={session.user} />
          <main className="max-w-6xl w-full px-4 sm:px-6 py-4 sm:py-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
