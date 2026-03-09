import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash } from "lucide-react";
import { ReactNode, useState, useTransition } from "react";

export function BaUpdateComplaintDialog({
  children,
}: {
  children?: ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {});
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive" size="sm">
            <Trash className="size-4" />
            <span>Update</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update the complaint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
