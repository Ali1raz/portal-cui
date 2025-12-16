import { Role } from "@/lib/generated/prisma/enums";
import { requireSession } from "../data/session/require-session";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { StudentSidebar } from "./_components/student-sidebar";
import { SiteHeader } from "./_components/site-header";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (session.user.role !== Role.STUDENT) {
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
        <StudentSidebar variant="inset" user={session.user} />
        <SidebarInset>
          <SiteHeader user={session.user} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
