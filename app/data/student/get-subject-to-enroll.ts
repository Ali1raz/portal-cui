import prisma from "@/lib/prisma";
import "server-only";
import { requireSession } from "../session/require-session";

export async function studentGetSubjectsToEnroll() {
  const session = await requireSession();
  const now = new Date();

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      department: true,
    },
  });

  //   if (!student) {
  //     return redirect("/unauthorized");
  //   }

  const reg = await prisma.registration.findFirst({
    where: {
      studentId: student?.id,
      status: "APPROVED",
      semester: {
        enrollmentStart: { lte: now },
        enrollmentEnd: { gte: now },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      semesterId: true,
      semester: {
        select: {
          enrollmentEnd: true,
          dropDeadline: true,
        },
      },
    },
  });

  // if (!reg?.semesterId) {
  //   return []; // No active registration found, so no subjects to enroll in
  // }

  const offerings = await prisma.subjectOffering.findMany({
    where: {
      semesterId: reg?.semesterId,
      department: student?.department,
      semester: {
        registrations: {
          some: {
            studentId: student?.id,
            status: "APPROVED",
          },
        },
      },
    },
    select: {
      id: true,
      department: true,
      subject: {
        select: {
          code: true,
          name: true,
          creditHours: true,
          id: true,
        },
      },
      enrollments: {
        where: { studentId: student?.id },
        select: {
          id: true,
          section: true,
          status: true,
        },
      },
      teachingAssignments: {
        where: {
          offering: {
            semesterId: reg?.semesterId,
            department: student?.department,
          },
        },
        orderBy: {
          section: "asc",
        },
        select: {
          section: true,
          professor: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  return offerings.map((offering) => {
    const studentEnrollment = offering.enrollments[0];
    const studentSection = studentEnrollment?.section ?? "A";

    const sectionMatchedTeacherName = studentSection
      ? offering.teachingAssignments.find(
          (assignment) => assignment.section === studentSection
        )?.professor.user.name
      : null;

    const teacherDisplay = sectionMatchedTeacherName
      ? `${sectionMatchedTeacherName} (${studentSection})`
      : offering.teachingAssignments
          .map(
            (assignment) =>
              `${assignment.professor.user.name} (${assignment.section ?? "A"})`
          )
          .join(", ") || "TBA";
    console.log(studentEnrollment?.status);
    return {
      id: offering.id,
      department: offering.department,
      subject: offering.subject,
      teacherDisplay,
      enrollStatus: studentEnrollment?.status ?? "PENDING",
    };
  });
}

export type StudentGetSubjectsToEnrollType = Awaited<
  ReturnType<typeof studentGetSubjectsToEnroll>
>[number];
