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
import { EyeIcon, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { DeleteLeaveRequestDialog } from "./delete-leave-request-dialog";
import { EDITABLE_LEAVE_REQUEST_STATUS } from "@/lib/data/utils";

/// Actions dropdown for leave request table rows including View Details and Edit options.
export function LeaveRequestActions({
  leaveRequestId,
  status,
}: {
  leaveRequestId: string;
  status: LeaveStatus;
}) {
  const isEditable = EDITABLE_LEAVE_REQUEST_STATUS.includes(status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/student/past-leave-requests/${leaveRequestId}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        {isEditable ? (
          <DropdownMenuItem asChild>
            <Link href={`/student/past-leave-requests/${leaveRequestId}/edit`}>
              <SquarePen className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>
            <SquarePen className="size-4" />
            Edit
          </DropdownMenuItem>
        )}

        {isEditable ? (
          <DeleteLeaveRequestDialog leaveRequestId={leaveRequestId}>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DeleteLeaveRequestDialog>
        ) : (
          <DropdownMenuItem disabled>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
