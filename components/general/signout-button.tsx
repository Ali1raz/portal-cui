"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-signout";
import clsx from "clsx";

export function SignOutButton({ className }: { className?: string }) {
  const handleSignOut = useSignOut();

  return (
    <Button
      size="sm"
      className={clsx("cursor-pointer", className)}
      onClick={() => handleSignOut()}
    >
      Sign Out
    </Button>
  );
}
