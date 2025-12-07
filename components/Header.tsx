import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import UserAvatarDropdown from "./user-avatar";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky flex justify-between px-4 items-center top-0 z-10 w-full border-b bg-background/90 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="flex gap-6 container min-h-16 items-center mx-auto px-4 md:px-6">
        <Link href="/" className="text-xl font-bold">
          CUI Portal
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <UserAvatarDropdown
                name={
                  session.user.name && session.user.name.length > 0
                    ? session.user.name
                    : session.user.email.split("@")[0]
                }
                email={session.user.email}
                image={session.user.image!}
              />
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
