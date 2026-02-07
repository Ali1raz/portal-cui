import "server-only";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

/// Fetch subject data for edit page.
export async function adminGetSubjectForEdit(subjectId: string) {
  const can = await requirePermission({
    subject: ["update"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId },
    select: {
      id: true,
      name: true,
      code: true,
      creditHours: true,
    },
  });

  if (!subject) {
    return notFound();
  }

  return subject;
}

export type AdminSubjectForEdit = Awaited<
  ReturnType<typeof adminGetSubjectForEdit>
>;
