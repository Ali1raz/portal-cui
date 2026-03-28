import "server-only";

import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";
import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";

export async function getProfessorSubjectDetails(offeringId: string) {
  const session = await requireProfessorSession();

  const can = await requirePermission({
    subject: ["get"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const teachingAssignment = await prisma.teachingAssignment.findFirst({
    where: {
      AND: [
        { professor: { userId: session.user.id } },
        { offeringId: offeringId },
      ],
    },
    select: {
      section: true,
      offering: {
        include: {
          semester: {
            select: {
              semester: true,
            },
          },
          subject: {
            select: { id: true, code: true, name: true, creditHours: true },
          },
        },
      },
    },
  });

  if (!teachingAssignment) {
    return redirect("/unauthorized");
  }

  const enrollments = await prisma.enrollment.count({
    where: {
      offeringId: teachingAssignment?.offering.id,
    },
  });

  const pendingLeaveRequests = await prisma.leaveRequest.count({
    where: {
      status: "PENDING",
      offeringId: teachingAssignment.offering.id,
    },
  });

  return {
    totalStudents: enrollments,
    subject: teachingAssignment.offering.subject,
    section: teachingAssignment.section,
    semester: teachingAssignment.offering.semester?.semester,
    pendingLeaveRequests,
  };
}
