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
import { Role } from "@/lib/generated/prisma/enums";
import { EyeIcon, MoreHorizontal, UserPen } from "lucide-react";
import Link from "next/link";
import type { ChangeUserRoleTarget } from "../user-role-form-schema";
import { ChangeUserRoleDialog } from "./change-role";
import { SetDepartmentDialog } from "./set-department-dialog";

export function UserActions({ user }: { user: ChangeUserRoleTarget }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        <ChangeUserRoleDialog user={user}>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <UserPen className="size-4" />
            Update Role
          </DropdownMenuItem>
        </ChangeUserRoleDialog>

        {user.role === Role.PROFESSOR || user.role === "HOD" ? (
          <SetDepartmentDialog userId={user.id} name={user.name}>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <UserPen className="size-4" />
              Set Department
            </DropdownMenuItem>
          </SetDepartmentDialog>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
