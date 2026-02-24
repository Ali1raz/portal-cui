"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateProfileSchema, UpdateProfileType } from "../schema";
import { tryCatch } from "@/hooks/tryCatch";
import { updateProfileAction } from "../actions";
import Uploader from "@/components/uploader";
import { useSession } from "@/lib/auth-client";

export function UpdateProfileForm() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      imageKey: session?.user?.image || "",
    },
    mode: "onChange",
  });

  function onSubmit(values: UpdateProfileType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        updateProfileAction(values, session?.user?.id || "")
      );

      if (error) {
        toast.error("Something bad happened");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message, { duration: 5000 });
      } else if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      }
    });
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Update Your Profile</h1>
      <p className="text-muted-foreground mb-4">
        Update your profile information
      </p>
      <section className="mt-4">
        <div className="space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your display name. Choose a readable name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageKey"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <Uploader
                        fileTypeAccepted="image"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      This is optional but highly recommended.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    &nbsp;Updating profile...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </section>
    </section>
  );
}
