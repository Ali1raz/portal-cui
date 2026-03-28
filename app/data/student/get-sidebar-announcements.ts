import "server-only";

import { requirePermission } from "../permission/require-permission";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";

export async function studentGetSidebarAnnouncements() {
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

  // Base where clause for targeting
  const baseWhere = {
    status: "PUBLISHED" as const,
    // Announcement must target student's department OR be a broadcast (null department)
    OR: [{ targetDepartment: student.department }, { targetDepartment: null }],
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
  };

  const selectFields = {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    isPinned: true,
    publishedAt: true,
    author: {
      select: {
        image: true,
        name: true,
        role: true,
      },
    },
  };

  // Fetch all pinned announcements
  const pinnedAnnouncements = await prisma.announcement.findMany({
    where: {
      ...baseWhere,
      isPinned: true,
    },
    orderBy: [
      { createdAt: "desc" }, // Newest pinned first
      { publishedAt: "desc" },
    ],
    select: selectFields,
  });

  // Fetch 2-3 most recent unpinned announcements
  const unpinnedAnnouncements = await prisma.announcement.findMany({
    where: {
      ...baseWhere,
      isPinned: false,
    },
    orderBy: [
      { createdAt: "desc" }, // Newest unpinned first
      { publishedAt: "desc" },
    ],
    take: 3,
    select: selectFields,
  });

  // Combine pinned and unpinned announcements
  const ann = [...pinnedAnnouncements, ...unpinnedAnnouncements];

  return ann;
}

export type StudentSidebarAnnouncementType = Awaited<
  ReturnType<typeof studentGetSidebarAnnouncements>
>[number];
