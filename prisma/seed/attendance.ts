import prisma from "@/lib/prisma";
import { AttendanceStatus } from "@/lib/generated/prisma/enums";

export async function seedAttendance() {
  console.log("\n📅 Seeding Attendance...");

  const offerings = await prisma.subjectOffering.findMany({
    include: {
      enrollments: true,
    },
  });

  const TOTAL_LECTURES = 32;
  const START_DATE = new Date(new Date().getFullYear(), 0, 15); // Jan 15th start

  for (const offering of offerings) {
    // Check if attendance already exists
    const existing = await prisma.attendanceRecord.findFirst({
      where: { offeringId: offering.id },
    });

    if (existing) {
      console.log(`Skipping attendance for ${offering.id} (already seeded)`);
      continue;
    }

    console.log(
      `Seeding ${offering.id} (${offering.enrollments.length} Students)...`
    );

    for (let i = 1; i <= TOTAL_LECTURES; i++) {
      const lectureDate = new Date(START_DATE);
      lectureDate.setDate(START_DATE.getDate() + i * 2); // Every other day roughly

      // Skip weekends roughly
      if (lectureDate.getDay() === 0)
        lectureDate.setDate(lectureDate.getDate() + 1);
      if (lectureDate.getDay() === 6)
        lectureDate.setDate(lectureDate.getDate() + 2);

      const startTime = new Date(lectureDate);
      startTime.setHours(9, 0, 0);

      const endTime = new Date(lectureDate);
      endTime.setHours(10, 30, 0);

      const record = await prisma.attendanceRecord.create({
        data: {
          date: lectureDate,
          startTime: "09:00",
          endTime: "10:30",
          topic: `Lecture ${i}: Topic ${i}`,
          offeringId: offering.id,
        },
      });

      const students = offering.enrollments.map((e) => e.studentId);

      const studentAttendanceData = students.map((studentId) => {
        // Weighted Random Status
        const rand = Math.random();
        let status: keyof typeof AttendanceStatus = "PRESENT";
        if (rand > 0.95) {
          status = "ABSENT";
        } else if (rand > 0.85) {
          status = "ABSENT";
        }

        return {
          recordId: record.id,
          studentId,
          status: AttendanceStatus[status],
        };
      });

      await prisma.studentAttendance.createMany({
        data: studentAttendanceData,
      });
    }
  }
}
