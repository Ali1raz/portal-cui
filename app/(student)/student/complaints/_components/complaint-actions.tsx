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
import { ComplaintStatus } from "@/lib/generated/prisma/enums";
import { DeleteComplaintDialog } from "./delete-complaint-dialog";

/// Actions dropdown for complaint table rows including View Details and Edit options.
export function ComplaintActions({
  complaintId,
  status,
}: {
  complaintId: string;
  status: ComplaintStatus;
}) {
  const canEdit =
    status === ComplaintStatus.BA_PENDING ||
    status === ComplaintStatus.BA_REJECTED;

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
          <Link href={`/student/complaints/${complaintId}`}>
            <EyeIcon className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>

        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/student/complaints/${complaintId}/edit`}>
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

        {canEdit ? (
          <DeleteComplaintDialog complaintId={complaintId}>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DeleteComplaintDialog>
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
