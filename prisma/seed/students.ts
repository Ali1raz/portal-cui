import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import { SEED_USERS } from "./data";
import { ensureUser, generateRegistrationNo } from "./utils";

export async function seedStudents() {
  console.log("\n🎓 Seeding Students...");
  const students = SEED_USERS.filter((u) => u.role === Role.STUDENT);

  let index = 0;

  for (const user of students) {
    if (!user.department || !user.program || !user.batch) continue;

    await ensureUser(user);

    index++;
    const registrationNo = generateRegistrationNo({
      usersLength: index,
      department: user.department,
      program: user.program,
      batch: user.batch,
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {
        department: user.department,
        program: user.program,
        registrationNo,
      },
      create: {
        userId: user.id,
        department: user.department,
        program: user.program,
        registrationNo,
      },
    });

    const currentYear = new Date().getFullYear();
    await prisma.registration.upsert({
      where: { studentId: student.id },
      update: {
        semester: 1,
        year: currentYear,
        batch: user.batch,
      },
      create: {
        studentId: student.id,
        semester: 1,
        year: currentYear,
        batch: user.batch,
      },
    });

    console.log(`  ✓ Student: ${user.name} (${registrationNo})`);
  }
}

export async function seedStudentEnrollments() {
  console.log("\n✍️  Seeding Student Enrollments...");
  const students = SEED_USERS.filter(
    (u) => u.role === Role.STUDENT && u.enrolled && u.enrolled.length > 0
  );
  const currentYear = new Date().getFullYear();
  const semester = 1;

  for (const user of students) {
    // Find Student Record
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      console.error(
        `  ⚠️ Skipping enrollments for ${user.name}: Student record not found.`
      );
      continue;
    }

    if (!user.enrolled) continue;

    for (const subjectCode of user.enrolled) {
      const offeringId = `offering-${subjectCode}-${semester}-${currentYear}`;

      try {
        await prisma.enrollment.upsert({
          where: {
            studentId_offeringId: {
              studentId: student.id,
              offeringId,
            },
          },
          update: {},
          create: {
            studentId: student.id,
            offeringId,
          },
        });
        console.log(`  ✓ Enrolled ${user.name} in ${subjectCode}`);
      } catch (e) {
        // Likely offering doesn't exist or other issue
        console.error(
          `  ✗ Failed to enroll ${user.name} in ${subjectCode}:`,
          e
        );
      }
    }
  }
}
