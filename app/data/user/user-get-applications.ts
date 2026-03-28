import "server-only";
import { requireSession } from "../session/require-session";
import { requirePermission } from "../permission/require-permission";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function userGetApplications() {
  const session = await requireSession();
  const can = await requirePermission({ applications: ["list:own"] });

  if (!can) {
    return redirect("/unauthorized");
  }

  const applications = await prisma.studentApplication.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
      _count: {
        select: {
          applicationReviews: {
            where: {
              action: { not: "SUBMITTED" },
            },
          },
        },
      },
      preferredDepartment: true,
      submittedAt: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return applications;
}
