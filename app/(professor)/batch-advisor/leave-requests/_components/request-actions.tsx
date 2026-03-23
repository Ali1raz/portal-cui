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
import { LeaveStatus } from "@/lib/generated/prisma/enums";
import { Cog, EyeIcon, MoreHorizontal } from "lucide-react";

const REVIEWABLE_STATUSES: LeaveStatus[] = ["PENDING", "REVIEW_REQUESTED"];

export function RequestActions({
  leaveRequestId,
  status,
}: {
  leaveRequestId: string;
  status: LeaveStatus;
}) {
  const canReview = REVIEWABLE_STATUSES.includes(status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal aria-label="More Actions" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={`/batch-advisor/leave-requests/${leaveRequestId}`}>
            <EyeIcon className="size-4" />
            View Details
          </a>
        </DropdownMenuItem>

        {canReview ? (
          <DropdownMenuItem asChild>
            <a
              href={`/batch-advisor/leave-requests/${leaveRequestId}/update-status`}
            >
              <Cog className="size-4" />
              Update Status
            </a>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
