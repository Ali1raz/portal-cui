"use client";

import { useState } from "react";
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
import {
  EyeIcon,
  MoreHorizontal,
  ShieldOff,
  UserCheck,
  UserPen,
} from "lucide-react";
import Link from "next/link";
import type { ChangeUserRoleTarget } from "../user-role-form-schema";
import { BanUserDialog } from "./ban-user-dialog";
import { ChangeUserRoleDialog } from "./change-role";
import { SetDepartmentDialog } from "./set-department-dialog";
import { UnbanUserDialog } from "./unban-user-dialog";

export function UserActions({ user }: { user: ChangeUserRoleTarget }) {
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);

  return (
    <>
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

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            variant="destructive"
          >
            {user.banned ? (
              <button
                type="button"
                className="flex items-center gap-2 w-full"
                onClick={() => setUnbanOpen(true)}
              >
                <UserCheck className="size-4" />
                Unban User
              </button>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 w-full"
                onClick={() => setBanOpen(true)}
              >
                <ShieldOff className="size-4" />
                Ban User
              </button>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog
        userId={user.id}
        userName={user.name ?? "this user"}
        open={banOpen}
        onOpenChange={setBanOpen}
      />
      <UnbanUserDialog
        userId={user.id}
        userName={user.name ?? "this user"}
        open={unbanOpen}
        onOpenChange={setUnbanOpen}
      />
    </>
  );
}
