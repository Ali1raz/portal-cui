"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { tryCatch } from "@/hooks/tryCatch";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setUserRole } from "../actions";
import { Role } from "@/lib/generated/prisma/enums";
import { ASSIGNABLE_ROLES } from "@/lib/utils";

export function ChangeUserRoleDialog({
  children,
  userId,
  userRole,
  name,
}: {
  children?: React.ReactNode;
  userId: string;
  name: string | null;
  userRole: Role;
}) {
  const [role, setRole] = useState<Role>(userRole);
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(setUserRole(userId, role));

      if (error) {
        toast.error("Something went wrong.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            Change user role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Are sure to change role of {name}?</DialogTitle>
          <DialogDescription>
            Current user role is{" "}
            <span className="font-extrabold">{userRole}</span>.
          </DialogDescription>
        </DialogHeader>
        <Select onValueChange={(value) => setRole(value as Role)} value={role}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>

          <SelectContent>
            {Object.values(ASSIGNABLE_ROLES).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter className="w-full">
          <Button
            disabled={isPending}
            onClick={handleChange}
            variant="destructive"
          >
            {isPending ? "Loading..." : "Confirm"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
