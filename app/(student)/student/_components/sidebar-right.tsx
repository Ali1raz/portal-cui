import { ArrowUpRightFromSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import React, { Suspense } from "react";
import {
  StudentsSidebarAnnoucementsList,
  StudentsSidebarAnnouncementsListSkeleton,
} from "./student-sidebar-announcements-list";
import Link from "next/link";

export function RightSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4 h-16 flex flex-row">
        <SidebarRail />
        <h1 className="text-lg font-semibold ">Announcements</h1>
      </SidebarHeader>

      <SidebarContent className="space-y-4 p-2">
        <Suspense fallback={StudentsSidebarAnnouncementsListSkeleton()}>
          <StudentsSidebarAnnoucementsList />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/student/announcements">
                <ArrowUpRightFromSquare />
                <span>View All</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
