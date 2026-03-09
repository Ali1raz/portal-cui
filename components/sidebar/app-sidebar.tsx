"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@/lib/auth";
import Link from "next/link";
import { NavUser } from "@/components/sidebar/nav-user";
import { NavMain } from "./nav-main";
import { Role } from "@/lib/generated/prisma/enums";
import Image from "next/image";
import { NavSecondary } from "./nav-secondary";

export function AppSidebar({
  user,
  isBA,

  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User; isBA?: boolean }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Image src="/cui.svg" alt="CUI" height={24} width={24} />
                <span className="text-base font-semibold">CUI Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain role={user.role as Role} />
        {user.role === Role.PROFESSOR && isBA && (
          <NavSecondary className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
