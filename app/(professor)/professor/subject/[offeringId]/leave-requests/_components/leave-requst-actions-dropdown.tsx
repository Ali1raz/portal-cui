import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface iAppProps {
  requestId: string;
  offeringId: string;
  children?: React.ReactNode;
}

export function ProfessorLeaveRequestDropdown({
  requestId,
  offeringId,
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
            href={`/professor/subject/${offeringId}/leave-requests/${requestId}`}
            className="flex items-center gap-2"
          >
            <Eye className="size-4" />
            View details
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
