"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tryCatch } from "@/hooks/tryCatch";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Department } from "@/lib/generated/prisma/enums";
import { setProfessorDepartment } from "../actions";

/// Dialog for assigning department to professor
export function SetDepartmentDialog({
  children,
  userId,
  name,
}: {
  children?: React.ReactNode;
  userId: string;
  name: string | null;
}) {
  const [dept, setDept] = useState<Department>("BA");
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        setProfessorDepartment(userId, dept)
      );
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
            Set Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Assign department for {name}</DialogTitle>
        </DialogHeader>
        <Select
          onValueChange={(value) => setDept(value as Department)}
          value={dept}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Department).map((d) => (
              <SelectItem key={d} value={d}>
                {d}
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
