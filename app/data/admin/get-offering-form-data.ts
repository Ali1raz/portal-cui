import "server-only";
import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

/// Fetch subjects for admin offering creation.
export async function adminGetOfferingFormData() {
  const can = await requirePermission({
    subjectOfferings: ["create"],
  });
  if (!can) {
    return redirect("/unauthorized");
  }

  const [subjects, semesters] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        creditHours: true,
      },
    }),

    prisma.semester.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ year: "desc" }, { semester: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        semester: true,
        program: true,
        year: true,
        department: true,
        batch: true,
        isActive: true,
        enrollmentStart: true,
        enrollmentEnd: true,
      },
    }),
  ]);

  return { subjects, semesters };
}
export type AdminOfferingFormSubject = Awaited<
  ReturnType<typeof adminGetOfferingFormData>
>["subjects"][number];
export type AdminOfferingFormSemester = Awaited<
  ReturnType<typeof adminGetOfferingFormData>
>["semesters"][number];
