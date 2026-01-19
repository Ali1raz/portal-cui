"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/generated/prisma/enums";
import { getNavLinks } from "./navlinks";

export function NavMain({ role }: { role: Role | null | undefined }) {
  const pathName = usePathname();

  const navLinks = getNavLinks({ userRole: role });

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {navLinks.map((item, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={cn(
                  pathName === item.href &&
                    "bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground min-w-8 duration-200 ease-linear"
                )}
              >
                <Link href={item.href}>
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
