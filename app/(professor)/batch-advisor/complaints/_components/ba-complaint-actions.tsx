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
import { EyeIcon, MoreHorizontal, Settings } from "lucide-react";
import Link from "next/link";

/// Actions dropdown for BA complaint table rows including View Details and Update Status.
export function BaComplaintActions({ complaintId }: { complaintId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/batch-advisor/complaints/${complaintId}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/batch-advisor/complaints/${complaintId}/update-status`}>
            <Settings className="size-4" />
            Update Status
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
