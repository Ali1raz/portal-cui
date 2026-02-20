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
      registration: { select: { batch: true, year: true } },
    },
  });

  if (!student) {
    return redirect("/unauthorized");
  }

  const studentBatch = student.registration?.batch;
  const studentYear = student.registration?.year;

  const announcement = await prisma.announcement.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      // Only show announcements from HOD of student's department
      author: {
        hod: {
          department: student.department,
        },
      },
      // Respect targeting filters
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
