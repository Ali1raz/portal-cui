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
      registration: { select: { batch: true } },
    },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  // Extract batch (FA/SP) and year from registration number (e.g., "FA22-BSE-001")
  const studentBatch = student.registration?.batch || null;

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
        {
          OR: [
            { targetBatch: null },
            ...(studentBatch ? [{ targetBatch: studentBatch }] : []),
          ],
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
    // isPinned announcements should always come first, followed by the rest sorted by published date
    orderBy: [
      { isPinned: "desc" }, // Pinned announcements come first
      { publishedAt: "desc" }, // Then by published date
      { createdAt: "desc" }, // Fallback to creation date
    ],
    // take: 5,
    select: {
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
    },
  });

  return ann;
}

export type StudentSidebarAnnouncementType = Awaited<
  ReturnType<typeof studentGetSidebarAnnouncements>
>[number];
