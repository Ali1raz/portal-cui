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
import { EyeIcon, MoreHorizontal, UserRoundPen } from "lucide-react";
import Link from "next/link";

export function ClerkApplicationActions({
  applicationId,
}: {
  applicationId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Application Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/clerk/applications/${applicationId}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/clerk/applications/${applicationId}/update-status`}>
            <UserRoundPen className="size-4" />
            Update Status
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
