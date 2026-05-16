"use client";

import { useState } from "react";
import { ShieldOff, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BanUserDialog } from "../../_components/ban-user-dialog";
import { UnbanUserDialog } from "../../_components/unban-user-dialog";

export function BanActions({
  userId,
  userName,
  banned,
}: {
  userId: string;
  userName: string;
  banned: boolean | null;
}) {
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);

  return (
    <>
      {banned ? (
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 w-fit"
            onClick={() => setUnbanOpen(true)}
          >
            <UserCheck className="size-4" />
            Unban User
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 w-fit"
          onClick={() => setBanOpen(true)}
        >
          <ShieldOff className="size-4" />
          Ban User
        </Button>
      )}

      <BanUserDialog
        userId={userId}
        userName={userName}
        open={banOpen}
        onOpenChange={setBanOpen}
      />
      <UnbanUserDialog
        userId={userId}
        userName={userName}
        open={unbanOpen}
        onOpenChange={setUnbanOpen}
      />
    </>
  );
}
