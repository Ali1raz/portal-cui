import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarProvider as RightSidebarProvider } from "@/components/ui/sidebar";
import React, { Suspense } from "react";
import {
  StudentsSidebarAnnoucementsList,
  StudentsSidebarAnnouncementsListSkeleton,
} from "./student-sidebar-announcements-list";

export function RightSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {}) {
  return (
    <RightSidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="w-min!"
    >
      <Sidebar
        collapsible="none"
        side="right"
        className="sticky top-0 hidden h-svh border-l xl:flex"
        {...props}
      >
        <SidebarHeader className="p-6 h-16">
          <h1 className="text-lg font-semibold ">Announcements</h1>
        </SidebarHeader>

        <SidebarContent className="space-y-4 p-4">
          <Suspense fallback={StudentsSidebarAnnouncementsListSkeleton()}>
            <StudentsSidebarAnnoucementsList />
          </Suspense>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus />
                <span>New Calendar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </RightSidebarProvider>
  );
}
