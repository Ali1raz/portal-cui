import "server-only";
import { requirePermission } from "../permission/require-permission";
import prisma from "@/lib/prisma";
import { requireSession } from "../session/require-session";
import { redirect } from "next/navigation";

export async function studentGetAllAnnouncements() {
  // This function is currently identical to studentGetSidebarAnnouncements.
  // In the future, you might want to add pagination, filtering, or return more details for the full announcements page.
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
      registration: { select: { batch: true, year: true, semester: true } },
    },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const studentBatch = student.registration?.batch;
  const studentYear = student.registration?.year;

  const ann = await prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
      // Only show announcements from HOD of student's department
      author: {
        hod: {
          department: student.department,
        },
      },
      // Respect targeting filters
      // null shows to everyone, otherwise must match student's details
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
        {
          OR: [
            { targetYear: null },
            ...(studentYear ? [{ targetYear: studentYear }] : []),
          ],
        },
      ],
    },
    orderBy: [
      { isPinned: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
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
