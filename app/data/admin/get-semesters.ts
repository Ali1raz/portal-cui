import "server-only";

import prisma from "@/lib/prisma";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

export async function adminGetSemesters() {
  const can = await requirePermission({
    semesters: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const semesters = await prisma.semester.findMany({
    orderBy: [{ year: "desc" }, { semester: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      semester: true,
      year: true,
      department: true,
      batch: true,
      isActive: true,
      startDate: true,
      endDate: true,
      registrationStart: true,
      registrationEnd: true,
      enrollmentStart: true,
      enrollmentEnd: true,
      addDeadline: true,
      dropDeadline: true,
      lateDropDeadline: true,
      _count: {
        select: {
          registrations: true,
          subjectOfferings: true,
        },
      },
    },
  });

  return { semesters };
}

export type AdminSemester = Awaited<
  ReturnType<typeof adminGetSemesters>
>["semesters"][number];
