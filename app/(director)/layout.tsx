import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Role } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { requireSession } from "../data/session/require-session";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";

export default async function DirectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (session.user.role !== Role.DIRECTOR) {
    console.log(session.user.role);
    return redirect("/unauthorized");
  }

  return (
    <main>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={session.user} />
        <SidebarInset>
          <SiteHeader user={session.user} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
