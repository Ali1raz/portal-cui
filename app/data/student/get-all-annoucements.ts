import "server-only";
import { requirePermission } from "../permission/require-permission";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { redirect } from "next/navigation";

export async function studentGetAllAnnouncements() {
  const can = await requirePermission({
    announcements: ["list"],
  });

  if (!can) {
    return redirect("/unauthorized");
  }

  // Get current user's student record to access their department and program details
  const session = await requireSession();
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      department: true,
      program: true,
      registrationNo: true,
    },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const yearMatch = student.registrationNo.match(/\d{2}/);
  const studentYear = yearMatch ? 2000 + parseInt(yearMatch[0]) : null;

  const ann = await prisma.announcement.findMany({
    where: {
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
    orderBy: [
      { isPinned: "desc" }, // Pinned announcements come first
      { createdAt: "desc" }, // Then by creation date (newest first)
      { publishedAt: "desc" }, // Fallback to published date
    ],
    select: {
      id: true,
      title: true,
      content: true,
      imageKey: true,
      type: true,
      isPinned: true,
      publishedAt: true,
      createdAt: true,
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

  return ann;
}

export type StudentGetAllAnnouncementsType = Awaited<
  ReturnType<typeof studentGetAllAnnouncements>
>[number];
