import { Metadata } from "next";
import { Role } from "@/lib/generated/prisma/enums";
import { requireSession } from "../data/session/require-session";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { isProfessorBA } from "../data/professor/get-professor-details";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Professor Dashboard",
    default: "Professor Dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const isBA = await isProfessorBA();

  if (session.user.role !== Role.PROFESSOR) {
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
        <AppSidebar variant="inset" user={session.user} isBA={isBA} />
        <SidebarInset>
          <SiteHeader user={session.user} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
