import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import "server-only";
import { requirePermission } from "../permission/require-permission";

export async function adminGetOfferingDetails(offeringId: string) {
  const can = await requirePermission({
    subjectOfferings: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const offering = await prisma.subjectOffering.findFirst({
    where: {
      id: offeringId,
    },
    select: {
      id: true,
    },
  });
  if (!offering) {
    return notFound();
  }

  const [offeringDetails, teachingAssignments, totalEnrollments] =
    await Promise.all([
      prisma.subjectOffering.findFirst({
        where: {
          id: offering.id,
        },
        select: {
          id: true,
          createdAt: true,
          department: true,
          section: true,
          semester: true,
          totalLectures: true,
          year: true,
          subject: {
            select: {
              id: true,
              name: true,
              creditHours: true,
              code: true,
            },
          },
        },
      }),
      prisma.teachingAssignment.findMany({
        where: {
          offeringId: offeringId,
        },
        select: {
          id: true,
          professor: {
            select: {
              department: true,
              employeeNo: true,
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  teachingAssignments: true,
                },
              },
            },
          },
        },
      }),
      prisma.student.count({
        where: {
          enrollments: {
            some: {},
          },
        },
      }),
    ]);

  return { offeringDetails, teachingAssignments, totalEnrollments };
}
