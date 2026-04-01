import "server-only";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

export async function getClerkApplicationDetails(applicationId: string) {
  const can = await requirePermission({ applications: ["get"] });

  if (!can) {
    return redirect("/unauthorized");
  }

  const application = await prisma.studentApplication.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      status: true,
      attemptNo: true,
      user: {
        select: {
          email: true,
        },
      },
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

  if (!application) {
    return notFound();
  }

  return application;
}
