import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

export const requireSession = cache(async () => {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  return session;
});
