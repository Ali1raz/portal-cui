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
import { ChangeUserRoleDialog } from "./change-role";
import { SetDepartmentDialog } from "./set-department-dialog";

export function UserActions({
  userId,
  userRole,
  name,
  hasDepartment,
}: {
  userId: string;
  name: string | null;
  userRole: Role;
  hasDepartment: boolean;
}) {
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
          <Link href={`/admin/users/${userId}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        <ChangeUserRoleDialog userRole={userRole} userId={userId} name={name}>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            <UserPen className="size-4" />
            Update Role
          </DropdownMenuItem>
        </ChangeUserRoleDialog>

        {/* Only show if user is professor and doesn't already have department */}
        {userRole === Role.PROFESSOR && !hasDepartment ? (
          <SetDepartmentDialog userId={userId} name={name}>
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
