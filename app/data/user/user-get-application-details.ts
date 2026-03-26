import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";

export async function userGetApplicationDetails(applicationId: string) {
  const session = await requireSession();

  const application = await prisma.studentApplication.findFirst({
    where: {
      id: applicationId,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
      attemptNo: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      city: true,
      phoneNo: true,
      previousDegree: true,
      previousInstitution: true,
      previousPassingYear: true,
      percentage: true,
      preferredDepartment: true,
      submittedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          applicationReviews: true,
        },
      },
      applicationReviews: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          actorRole: true,
          action: true,
          remarks: true,
          fromStatus: true,
          toStatus: true,
          createdAt: true,
        },
      },
    },
  });

  return application;
}
