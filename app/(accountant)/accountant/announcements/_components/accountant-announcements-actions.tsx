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
import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { AccountantAnnDelete } from "./accountant-ann-delete-dialog";

/// Actions dropdown for Accountant complaint table rows including View Details, Assign, and Update Status.
export function AccountantAnnouncementActions({
  announcementId,
}: {
  announcementId: string;
}) {
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
          <Link href={`/accountant/announcements/${announcementId}`}>
            <PencilLine className="size-4" />
            Update
          </Link>
        </DropdownMenuItem>
        <AccountantAnnDelete id={announcementId}>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 /> Delete
          </DropdownMenuItem>
        </AccountantAnnDelete>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
