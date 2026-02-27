import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { HodDeleteAnnouncement } from "../actions";

export function HodAnnDelete({
  children,
  id,
}: {
  id: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await toast.promise(
        (async () => {
          const result = await HodDeleteAnnouncement(id);
          if (result.status === "error") {
            throw new Error(result.message);
          }
          return result;
        })(),
        {
          loading: "Deleting announcement...",
          success: (data) => {
            router.refresh();
            setOpen(false);
            return data.message;
          },
          error: (err) => err?.message || "Something went wrong",
        }
      );
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive">
            <Trash className="size-4" />
            <span>Delete announcement</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this announcement</DialogTitle>
          <DialogDescription>
            Are you sure to delete this announcement?
          </DialogDescription>
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
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
