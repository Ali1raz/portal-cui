import "server-only";
import { requireSession } from "../session/require-session";
import prisma from "@/lib/prisma";

export async function userGetApplications() {
  const session = await requireSession();

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
