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
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { SemesterFeeStatus } from "@/lib/generated/prisma/enums";
import { AccFeeUpdateStatusDrawer } from "./acc-fee-update-status-drawer";

export function AccFeeTableActionsDropdown({
  feeId,
  currentStatus,
}: {
  feeId: string;
  currentStatus: SemesterFeeStatus;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open fee actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Fee Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/accountant/manage-fee/${feeId}`}>View Details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/accountant/manage-fee/${feeId}/edit`}>
            Edit Installments
          </Link>
        </DropdownMenuItem>
        <AccFeeUpdateStatusDrawer feeId={feeId} currentStatus={currentStatus}>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Update Status
          </DropdownMenuItem>
        </AccFeeUpdateStatusDrawer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
