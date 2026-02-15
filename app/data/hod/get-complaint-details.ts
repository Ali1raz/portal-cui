import "server-only";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";

/// Fetch complaint details for HOD from their department.
export async function hodGetComplaintDetails({ id }: { id: string }) {
  const session = await requireSession();
  const can = await requirePermission({
    complaints: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const hod = await prisma.hod.findUnique({
    where: { userId: session.user.id },
    select: { id: true, department: true },
  });

  if (!hod) {
    return redirect("/unauthorized");
  }

  const details = await prisma.complaint.findFirst({
    where: {
      id,
      targetDepartment: hod.department, // Only allow HOD to access complaints from their department
    },
    select: {
      id: true,
      title: true,
      details: true,
      category: true,
      status: true,
      targetDepartment: true,
      createdAt: true,
      imageKey: true,
      hodRemarks: true,
      student: {
        select: {
          registrationNo: true,
          department: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!details) {
    return notFound();
  }

  return details;
}

export type HodComplaintDetails = Awaited<
  ReturnType<typeof hodGetComplaintDetails>
>;
