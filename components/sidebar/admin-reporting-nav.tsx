"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheckupList,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminReportingLinks = [
  {
    title: "Complaints",
    href: "/admin/reporting/complaints",
    icon: IconAlertTriangle,
  },
  {
    title: "Leave Requests",
    href: "/admin/reporting/leave-requests",
    icon: IconCalendar,
  },
  {
    title: "Approved Leave Requests",
    href: "/admin/leave-requests/approved",
    icon: IconCheckupList,
  },
] as const;

export function AdminReportingNav() {
  const pathname = usePathname();

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CollapsibleTrigger>
            Reporting
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminReportingLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      asChild
                      className={cn(
                        isActive &&
                          "bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground min-w-8 duration-200 ease-linear"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
