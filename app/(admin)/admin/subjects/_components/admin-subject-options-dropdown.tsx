import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React from "react";

interface iAppProps {
  subjectId: string;
  children?: React.ReactNode;
}

export function AdminsubjectOptionsDropdown({
  subjectId,
  children,
}: iAppProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <MoreHorizontal className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            href={`/admin/subjects/${subjectId}/update`}
            className="flex items-center gap-2"
          >
            <Edit className="size-4" />
            Edit subject
          </Link>
        </DropdownMenuItem>
        {/* <DeleteCourseDialog courseId={id}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash className="size-4" />
                Delete Course
              </DropdownMenuItem>
            </DeleteCourseDialog> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
