"use client";

import { IconHome, IconUsers } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { URL } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/hod" as URL,
      icon: IconHome,
    },
    {
      title: "Leave Requests",
      url: "/hod/leave-requests" as URL,
      icon: IconUsers,
    },
    {
      title: "Past leave Requests",
      url: "/hod/past-leave-requests" as URL,
      icon: IconUsers,
    },
  ],
};

export function NavMain() {
  const pathName = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={cn(
                  pathName === item.url &&
                    "bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground min-w-8 duration-200 ease-linear"
                )}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
