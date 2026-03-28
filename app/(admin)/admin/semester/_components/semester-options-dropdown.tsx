"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, EyeIcon, Pencil, Plus } from "lucide-react";
import Link from "next/link";

export function SemesterOptionsDropdown({
  semesterId,
}: {
  semesterId: string;
}) {
  return (
    <ButtonGroup>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <Link href={`/admin/offering?semesterId=${semesterId}`}>
          <EyeIcon className="size-4" aria-hidden="true" />
          View Offerings
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Semester Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/admin/offering?semesterId=${semesterId}`}>
              <EyeIcon className="size-4" aria-hidden="true" />
              View Offerings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/offering/create?semesterId=${semesterId}`}>
              <Plus className="size-4" aria-hidden="true" />
              Create Subject Offering
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/admin/semester/${semesterId}/edit`}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit Semester
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
