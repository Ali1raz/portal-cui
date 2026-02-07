import "server-only";

import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { requirePermission } from "../permission/require-permission";

/// Fetch data needed for assigning a professor to an offering.
export async function adminGetOfferingAssignData(offeringId: string) {
  const can = await requirePermission({
    subjectOfferings: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const offering = await prisma.subjectOffering.findFirst({
    where: { id: offeringId },
    select: {
      id: true,
      department: true,
      section: true,
      semester: true,
      year: true,
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          creditHours: true,
        },
      },
      teachingAssignments: {
        select: {
          id: true,
          professor: {
            select: {
              id: true,
              employeeNo: true,
              department: true,
              user: {
                select: {
                  name: true,
                  image: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!offering) {
    return notFound();
  }

  const professors = await prisma.professor.findMany({
    orderBy: {
      user: { name: "asc" },
    },
    select: {
      id: true,
      employeeNo: true,
      department: true,
      user: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
      teachingAssignments: {
        select: {
          offering: {
            select: {
              id: true,
              department: true,
              section: true,
              semester: true,
              year: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { offering, professors };
}

export type AdminOfferingAssignOffering = Awaited<
  ReturnType<typeof adminGetOfferingAssignData>
>["offering"];

export type AdminOfferingAssignProfessor = Awaited<
  ReturnType<typeof adminGetOfferingAssignData>
>["professors"][number];
