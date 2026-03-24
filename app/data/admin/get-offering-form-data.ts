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

  const semesters = await prisma.semester.findMany({
    where: { isActive: true },
    orderBy: [{ year: "desc" }, { semester: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      semester: true,
      year: true,
      department: true,
      batch: true,
      isActive: true,
    },
  });

  return { subjects, semesters };
}

export type AdminOfferingFormSubject = Awaited<
  ReturnType<typeof adminGetOfferingFormData>
>["subjects"][number];

export type AdminOfferingFormSemester = Awaited<
  ReturnType<typeof adminGetOfferingFormData>
>["semesters"][number];
