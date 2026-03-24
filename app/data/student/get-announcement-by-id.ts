import "server-only";
import { requirePermission } from "../permission/require-permission";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { redirect } from "next/navigation";

export async function studentGetAnnouncementById(id: string) {
  const can = await requirePermission({
    announcements: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  const session = await requireSession();
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      department: true,
      program: true,
      registrationNo: true,
      registration: {
        select: {
          batch: true,
          semester: { select: { semester: true, year: true, batch: true } },
        },
      },
    },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const yearMatch = student.registrationNo.match(/\d{2}/);
  const studentYear = yearMatch ? 2000 + parseInt(yearMatch[0]) : null;

  const announcement = await prisma.announcement.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      // Announcement must target student's department OR be a broadcast (null department)
      OR: [
        { targetDepartment: student.department },
        { targetDepartment: null },
      ],
      // Additional targeting filters - if specified, they must match
      AND: [
        {
          OR: [{ targetProgram: null }, { targetProgram: student.program }],
        },
        ...(studentYear
          ? [
              {
                OR: [{ targetYear: null }, { targetYear: studentYear }],
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
      imageKey: true,
      type: true,
      isPinned: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
    },
  });

  if (!announcement) {
    return redirect("/student/announcements");
  }

  return announcement;
}

export type StudentAnnouncementDetailType = Awaited<
  ReturnType<typeof studentGetAnnouncementById>
>;
