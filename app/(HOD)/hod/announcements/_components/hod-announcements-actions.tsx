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
import { HodAnnDelete } from "./hod-ann-delete-dialog";

/// Actions dropdown for HOD complaint table rows including View Details, Assign, and Update Status.
export function HodAnnouncementActions({
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
          <Link href={`/hod/announcements/${announcementId}`}>
            <PencilLine className="size-4" />
            Update
          </Link>
        </DropdownMenuItem>
        <HodAnnDelete id={announcementId}>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 /> Delete
          </DropdownMenuItem>
        </HodAnnDelete>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
