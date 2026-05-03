"use client";

import { Android, Chrome, Edge, Windows } from "@/components/companies";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UserGetAllSessions } from "@/app/data/user/user-get-all-sessions";
import { ApiResponseType } from "@/lib/types";
import { tryCatch } from "@/hooks/tryCatch";
import {
  Monitor,
  Smartphone,
  Globe,
  Clock,
  Calendar,
  MapPin,
  LogOut,
  ShieldAlert,
  Apple,
  Flame,
} from "lucide-react";

export function UserSessionsCard({
  sessions,
  currentToken,
}: {
  sessions: UserGetAllSessions[];
  currentToken: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isAllPending, startAllTransition] = useTransition();
  const router = useRouter();

  async function revokeSessionByToken(token: string): Promise<ApiResponseType> {
    try {
      await authClient.revokeSession({ token });
      return { status: "success", message: "Successfully revoked session." };
    } catch {
      return { status: "error", message: "Something went wrong." };
    }
  }

  async function revokeOtherSessions(): Promise<ApiResponseType> {
    try {
      await authClient.revokeOtherSessions();
      return {
        status: "success",
        message: "Successfully revoked all other sessions.",
      };
    } catch {
      return { status: "error", message: "Something went wrong." };
    }
  }

  function handleRevokeSession(sessionToken: string) {
    startTransition(async () => {
      const { data: res, error } = await tryCatch(
        revokeSessionByToken(sessionToken)
      );
      if (error) {
        toast.error("Something went wrong.");
        return;
      }
      if (res.status === "success") {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.message);
    });
  }

  function handleRevokeOtherSessions() {
    startAllTransition(async () => {
      const { data: res, error } = await tryCatch(revokeOtherSessions());
      if (error) {
        toast.error("Something went wrong.");
        return;
      }
      if (res.status === "success") {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.message);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Active Sessions</h2>
        <p className=" text-muted-foreground">
          Manage where you&apos;re logged in. Revoke access from devices you
          don&apos;t recognize.
        </p>
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {sessions.map((session) => {
          const isCurrent = currentToken === session.token;
          const { browserIcon, browserName, osIcon, osName, deviceIcon } =
            getDeviceInfo(session.userAgent ?? null);

          return (
            <Card
              key={session.id}
              className={cn(
                "transition-all duration-200",
                isCurrent
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "hover:border-muted-foreground/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: icon + info */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Device icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-lg size-14 shrink-0 border",
                        isCurrent
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {deviceIcon}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-4">
                      {/* Browser + OS row */}
                      <div className="flex items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="size-4">{browserIcon}</span>
                          <span>{browserName}</span>
                        </div>
                        <span>on</span>
                        <div className="flex items-center gap-2 font-medium">
                          <span className="size-4 shrink-0">{osIcon}</span>
                          <span>{osName}</span>
                        </div>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="rounded bg-primary/10 text-primary border-primary/20"
                          >
                            CURRENT
                          </Badge>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 overflow-hidden text-ellipsis">
                        {session.ipAddress && (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="size-4" />
                            <code className="font-mono">
                              {session.ipAddress}
                            </code>
                          </span>
                        )}
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="size-4" />
                          Active{" "}
                          {format(session.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="size-4" />
                          Expires {format(session.expiresAt, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: revoke button */}
                  <Button
                    disabled={isPending}
                    onClick={() => handleRevokeSession(session.token)}
                    variant={"outline"}
                    className={cn(
                      "shrink-0 gap-1.5",
                      !isCurrent &&
                        "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    )}
                  >
                    <LogOut className="size-3.5" />
                    {isCurrent ? "Sign out" : "Revoke"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Danger zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <ShieldAlert className="size-6 text-destructive" />
            <CardTitle className="text-2xl text-destructive">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Signing out of all other devices will immediately invalidate their
            sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isAllPending}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Sign out all other devices
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex flex-col items-center text-center gap-2 ">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ShieldAlert className="size-6 text-destructive" />
                </div>
                <DialogTitle>Sign out all other devices?</DialogTitle>
                <DialogDescription>
                  This will immediately revoke access from every device except
                  your current one. They&apos;ll need to sign in again.
                </DialogDescription>
              </div>
              <DialogFooter className="">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleRevokeOtherSessions}
                  disabled={isAllPending}
                  size="sm"
                  className="flex-1"
                >
                  {isAllPending ? "Signing out…" : "Sign out all"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Device Detection ──────────────────────────────────────────────────────────

type DeviceInfo = {
  browserName: string;
  browserIcon: React.ReactNode;
  osName: string;
  osIcon: React.ReactNode;
  deviceIcon: React.ReactNode;
};

function getDeviceInfo(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      browserName: "Unknown Browser",
      browserIcon: <Globe className="size-4" />,
      osName: "Unknown OS",
      osIcon: <Monitor className="size-4" />,
      deviceIcon: <Monitor className="size-5" />,
    };
  }

  const ua = userAgent.toLowerCase();

  // Browser detection
  const browserName = ua.includes("edg/")
    ? "Edge"
    : ua.includes("chrome/")
      ? "Chrome"
      : ua.includes("firefox/")
        ? "Firefox"
        : ua.includes("safari/")
          ? "Safari"
          : "Browser";

  const browserIcon =
    browserName === "Edge" ? (
      <Edge className="size-4" />
    ) : browserName === "Chrome" ? (
      <Chrome className="size-4" />
    ) : browserName === "Firefox" ? (
      // Use Flame as stand-in if <Firefox /> isn't in companies
      <Flame className="size-4 text-orange-500" />
    ) : (
      <Globe className="size-4" />
    );

  // OS detection
  const isMobile =
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ios");

  const osName = ua.includes("windows")
    ? "Windows"
    : ua.includes("mac os") || ua.includes("macintosh")
      ? "macOS"
      : ua.includes("android")
        ? "Android"
        : ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")
          ? "iOS"
          : ua.includes("linux")
            ? "Linux"
            : "Unknown OS";

  const osIcon =
    osName === "Windows" ? (
      <Windows className="size-4" />
    ) : osName === "macOS" || osName === "iOS" ? (
      <Apple className="size-4" />
    ) : osName === "Android" ? (
      <Android className="size-4" />
    ) : (
      <Monitor className="size-4" />
    );

  const deviceIcon = isMobile ? (
    <Smartphone className="size-5" />
  ) : (
    <Monitor className="size-5" />
  );

  return { browserName, browserIcon, osName, osIcon, deviceIcon };
}
