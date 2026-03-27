import "server-only";

import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

export async function userGetApplicationDetails(applicationId: string) {
  const session = await requireSession();
  const can = await requirePermission({ applications: ["get:own"] });

  if (!can) {
    return redirect("/unauthorized");
  }

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
      semesterId: true,
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

  if (!application) {
    return notFound();
  }

  return application;
}

export type UserGetApplicationDetailsType = Awaited<
  ReturnType<typeof userGetApplicationDetails>
>;
