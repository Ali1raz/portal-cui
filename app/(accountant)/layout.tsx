import { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Role } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { requireSession } from "../data/session/require-session";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";

export const metadata: Metadata = {
  title: {
    template: "%s | Accountant Dashboard",
    default: "Accountant Dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (session.user.role !== Role.ACCOUNTANT) {
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
          <div className="max-w-6xl w-full p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
