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

  console.log(`All subjects (${SEED_SUBJECTS.length}) seeded successfully.`);
}
