import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider as LeftSidebarProvider,
} from "@/components/ui/sidebar";
import { User } from "@/lib/auth";
import { RightSidebar } from "./sidebar-right";
import { StudentSiteHeader } from "./studnet-site-header";

export function StudentLayoutProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  return (
    <LeftSidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <StudentSiteHeader user={user} />
        {children}
      </SidebarInset>
      <RightSidebar variant="inset" side="right" />
    </LeftSidebarProvider>
  );
}
