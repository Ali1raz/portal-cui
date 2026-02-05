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
import { Cog, EyeIcon, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { UpdateStatusDialog } from "../[requestId]/_components/update-status";
import { LeaveStatus } from "@/lib/generated/prisma/enums";

export function RequestActions({
  leaveRequestId,
  status,
}: {
  status: LeaveStatus;
  leaveRequestId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal aria-label="More Actions" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/hod/leave-requests/${leaveRequestId}`}>
            <EyeIcon className="size-4" aria-label="View Details" />
            View Details
          </Link>
        </DropdownMenuItem>
        <UpdateStatusDialog requestId={leaveRequestId} prevStatus={status}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Cog className="size-4" aria-label="View Details" />
            Update Status
          </DropdownMenuItem>
        </UpdateStatusDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
