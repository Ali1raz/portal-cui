"use client";

import { useRouter } from "next/navigation";
import { EyeIcon, MoreHorizontal, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FeeSplitRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            router.push(`/hod/fee/${requestId}`);
          }}
        >
          <EyeIcon className="size-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            router.push(`/hod/fee/${requestId}/review`);
          }}
        >
          <Settings className="size-4" />
          Review Request
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
