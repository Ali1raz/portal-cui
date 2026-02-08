import prisma from "@/lib/prisma";
import { requireStudentSession } from "./require-student-session";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";

export async function getStudentSubjects() {
  const session = await requireStudentSession();

  // 1. Get student and enrollments (without attendance records)
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      enrollments: {
        include: {
          offering: {
            select: {
              id: true,
              totalLectures: true,
              department: true,
              subject: {
                select: {
                  code: true,
                  name: true,
                  creditHours: true,
                },
              },
              teachingAssignments: {
                select: {
                  section: true,
                  professor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    return [];
  }

  // 2. For each offering, get attendance records for this student
  const results = [];
  for (const enrollment of student.enrollments) {
    const offering = enrollment.offering;
    const teacher =
      offering.teachingAssignments[0]?.professor.user.name ?? "TBA";

    // Query attendance records for this offering and student
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { offeringId: offering.id },
      select: {
        attendances: {
          where: { studentId: student.id },
          select: { status: true },
        },
      },
    });

    const totalLectures = attendanceRecords.length;
    const attendedLectures = attendanceRecords.filter(
      (record) =>
        record.attendances.length > 0 &&
        record.attendances[0].status === AttendanceStatus.PRESENT
    ).length;
    const attendancePercentage =
      totalLectures > 0
        ? Math.round((attendedLectures / totalLectures) * 100)
        : 0;

    results.push({
      code: offering.subject.code,
      name: offering.subject.name,
      creditHours: offering.subject.creditHours,
      teacherName: teacher,
      className: `${offering.department}-${offering.teachingAssignments[0]?.section ?? "A"}`,
      attendancePercentage,
    });
  }
  return results;
}

export type StudentSubject = Awaited<
  ReturnType<typeof getStudentSubjects>
>[number];
