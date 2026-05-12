import prisma from "@/lib/prisma";
import { requireProfessorSession } from "./require-professor-session";

export async function getOfferingLectures({
  offeringId,
}: {
  offeringId: string;
}) {
  const session = await requireProfessorSession();

  // Verify professor has access to this offering
  const assignment = await prisma.teachingAssignment.findFirst({
    where: {
      offeringId,
      professor: { userId: session.user.id },
    },
  });

  if (!assignment) {
    throw new Error("Unauthorized to access this subject.");
  }

  const lectures = await prisma.attendanceRecord.findMany({
    where: {
      offeringId,
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    include: {
      attendances: true, // We can count manually or use _count
    },
  });

  return lectures;
}

export type GetOfferingLecturesType = Awaited<
  ReturnType<typeof getOfferingLectures>
>[number];

export async function getLectureDetails({
  recordId,
  offeringId,
}: {
  recordId: string;
  offeringId: string;
}) {
  const session = await requireProfessorSession();

  // Verify professor has access to this offering
  const assignment = await prisma.teachingAssignment.findFirst({
    where: {
      offeringId,
      professor: { userId: session.user.id },
    },
  });

  if (!assignment) {
    throw new Error("Unauthorized to access this subject.");
  }

  const lecture = await prisma.attendanceRecord.findFirst({
    where: {
      id: recordId,
      offeringId,
    },
    include: {
      attendances: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lecture) {
    return null;
  }

  // Get total lectures for attendance percentage calculation
  const totalLectures = await prisma.attendanceRecord.count({
    where: { offeringId },
  });

  // Get all students in the offering
  const students = await prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          offeringId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const studentIds = students.map((student) => student.id);

  // Calculate attendance percentages
  const presentCounts = await prisma.studentAttendance.groupBy({
    by: ["studentId"],
    _count: {
      _all: true,
    },
    where: {
      studentId: { in: studentIds },
      status: "PRESENT",
      record: {
        offeringId,
      },
    },
  });

  const presentCountMap = new Map(
    presentCounts.map((entry) => [entry.studentId, entry._count._all])
  );

  // Add attendance percentages to attendances
  const attendancesWithPercentages = lecture.attendances.map((attendance) => {
    const presentCount = presentCountMap.get(attendance.studentId) ?? 0;
    const percentage =
      totalLectures > 0 ? (presentCount / totalLectures) * 100 : 0;

    return {
      ...attendance,
      attendancePercentage: Math.round(percentage * 100) / 100,
    };
  });

  return {
    ...lecture,
    attendances: attendancesWithPercentages,
  };
}
