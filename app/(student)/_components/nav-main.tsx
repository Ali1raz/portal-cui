"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { URL } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconCreditCard,
  IconHome,
  IconUser,
  IconUserCheck,
} from "@tabler/icons-react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/student" as URL,
      icon: IconHome,
    },
    {
      title: "Registration",
      url: "/student/registration" as URL,
      icon: IconUserCheck,
    },

    {
      title: "Fees",
      url: "/student/fee" as URL,
      icon: IconCreditCard,
    },
    {
      title: "Result card",
      url: "/students/fee" as URL,
      icon: GraduationCap,
    },
    {
      title: "Request leave",
      url: "/student/request-leave" as URL,
      icon: IconUserCheck,
    },
    {
      title: "Past leave Requests",
      url: "/student/past-leave-requests" as URL,
      icon: IconUserCheck,
    },
    {
      title: "Profile",
      url: "/student/profile" as URL,
      icon: IconUser,
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
