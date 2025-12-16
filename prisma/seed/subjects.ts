import prisma from "@/lib/prisma";
import { SEED_SUBJECTS } from "./data";

export async function seedSubjects() {
  console.log("\n📚 Seeding Subjects...");

  for (const subject of SEED_SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: subject.code }, // Code is unique
      update: {
        name: subject.name,
        // creditHours: 3 // Default
      },
      create: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        creditHours: 3,
      },
    });
    console.log(`  ✓ Subject: ${subject.name} (${subject.code})`);
  }
}

export async function seedOfferings() {
  console.log("\n🗓️ Seeding Offerings...");
  const currentYear = new Date().getFullYear();
  const semester = 1; // Default seeding semester

  for (const subject of SEED_SUBJECTS) {
    // Create an offering for EACH department that offers this subject
    for (const department of subject.departments) {
      const section = "A"; // Default section

      const primaryDept = department; // Just take the current loop iteration?

      if (department !== subject.departments[0]) continue;

      const offeringId = `offering-${subject.code}-${semester}-${currentYear}`;

      await prisma.subjectOffering.upsert({
        where: {
          subjectId_semester_year: {
            subjectId: subject.id,
            semester,
            year: currentYear,
          },
        },
        update: {
          section,
          department: primaryDept,
        },
        create: {
          id: offeringId,
          subjectId: subject.id,
          semester,
          totalLectures: 32,
          year: currentYear,
          section,
          department: primaryDept,
        },
      });
      console.log(`  ✓ Offering: ${subject.code} for ${primaryDept}`);
    }
  }
}
