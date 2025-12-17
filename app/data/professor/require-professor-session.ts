import "server-only";

import { requireSession } from "../session/require-session";
import { Role } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireProfessorSession = cache(async () => {
  const session = await requireSession();

  if (session.user.role !== Role.PROFESSOR) {
    return redirect("/unauthorized");
  }

  return session;
});
