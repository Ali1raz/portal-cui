import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EyeIcon, MoreHorizontal } from "lucide-react";
import { Route } from "next";
import Link from "next/link";

export function RequestActions({ leaveRequestId }: { leaveRequestId: string }) {
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
          <Link href={`/hod/leave-requests/${leaveRequestId}` as Route}>
            <EyeIcon className="size-4" aria-label="View Details" />
            View Details
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
