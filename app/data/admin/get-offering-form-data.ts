import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

/// Fetch subjects and professors for admin offering creation.
export async function adminGetOfferingFormData() {
  const can = await requirePermission({
    subjectOfferings: ["create"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      creditHours: true,
    },
  });

  return { subjects };
}

export type AdminOfferingFormSubject = Awaited<
  ReturnType<typeof adminGetOfferingFormData>
>["subjects"][number];
