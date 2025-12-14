"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EyeIcon, MoreHorizontal, UserPen } from "lucide-react";
import Link from "next/link";
import { Role } from "@/lib/generated/prisma/enums";
import { ChangeUserRoleModal } from "./change-role";

export function UserActions({
  userId,
  userRole,
  name,
}: {
  userId: string;
  name: string | null;
  userRole: Role;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/director/users/${userId}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        <ChangeUserRoleModal userRole={userRole} userId={userId} name={name}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <UserPen className="size-4" />
            Update Role
          </DropdownMenuItem>
        </ChangeUserRoleModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
