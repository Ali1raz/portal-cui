import "server-only";

import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";

export type StudentBannerType =
  | { type: "enrollment"; enrollmentEnd: Date }
  | { type: "leave-review"; id: string }
  | { type: "complaint-review"; id: string };

export async function getStudentBanners(): Promise<StudentBannerType[]> {
  const session = await requireStudentSession();

  const [leaveRequest, complaint, semester] = await Promise.all([
    prisma.leaveRequest.findFirst({
      where: {
        student: { userId: session.user.id },
        status: "REVIEW_REQUESTED",
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
    prisma.complaint.findFirst({
      where: {
        student: { userId: session.user.id },
        status: "BA_REVIEW_REQUESTED",
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
    prisma.semester.findFirst({
      where: { enrollmentEnd: { gt: new Date() } },
      select: { enrollmentEnd: true },
      orderBy: { enrollmentEnd: "asc" },
    }),
  ]);

  const banners: StudentBannerType[] = [];

  if (semester?.enrollmentEnd) {
    banners.push({ type: "enrollment", enrollmentEnd: semester.enrollmentEnd });
  }

  if (leaveRequest?.id) {
    banners.push({ type: "leave-review", id: leaveRequest.id });
  }

  if (complaint?.id) {
    banners.push({ type: "complaint-review", id: complaint.id });
  }

  return banners;
}
