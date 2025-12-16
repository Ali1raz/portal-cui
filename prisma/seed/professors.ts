import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import { SEED_USERS, SEED_SUBJECTS } from "./data";
import { ensureUser, generateEmployeeNo } from "./utils";

export async function seedProfessors() {
  console.log("\n👨‍🏫 Seeding Professors...");
  const professors = SEED_USERS.filter((u) => u.role === Role.PROFESSOR);

  for (const user of professors) {
    if (!user.department) continue;

    await ensureUser(user);

    const employeeNo =
      user.employeeNo ||
      generateEmployeeNo({
        name: user.name,
        department: user.department,
      });

    await prisma.professor.upsert({
      where: {
        userId: user.id,
      },
      update: {
        department: user.department,
        employeeNo,
      },
      create: {
        userId: user.id,
        employeeNo,
        department: user.department,
        programs: [],
      },
    });
    console.log(`  ✓ Professor: ${user.name} (${user.department})`);
  }
}

export async function seedProfessorAssignments() {
  console.log("\n📝 Seeding Professor Assignments...");
  const professors = SEED_USERS.filter(
    (u) => u.role === Role.PROFESSOR && u.teaches && u.teaches.length > 0
  );
  const currentYear = new Date().getFullYear();
  const semester = 1;

  for (const user of professors) {
    // Get the professor record to get their ID (which is same as user.id in our schema logic check, wait...
    // Professor ID is NOT user ID. Professor ID is UUID.
    // We need to fetch the Professor ID using the User ID.

    const professor = await prisma.professor.findUnique({
      where: { userId: user.id },
    });

    if (!professor) {
      console.error(
        `  ⚠️ Skipping assignments for ${user.name}: Professor record not found.`
      );
      continue;
    }

    if (!user.teaches) continue;

    for (const subjectCode of user.teaches) {
      // Find subject to get ID
      const subject = SEED_SUBJECTS.find((s) => s.code === subjectCode);
      if (!subject) {
        console.error(`  ⚠️ Subject not found in seed data: ${subjectCode}`);
        continue;
      }

      // Construct offering ID based on our deterministic logic in subjects.ts
      // logic: `offering-${subject.id}-${semester}-${currentYear}`
      // wait, subjects.ts logic was: `offering-${subjectCode}-${semester}-${currentYear}`
      // Checking subjects.ts...
      // `const offeringId = "offering-" + subject.code + "-" + semester + "-" + currentYear;`
      // Actually, let's verify subjects.ts content.

      const offeringId = `offering-${subject.code}-${semester}-${currentYear}`;

      // Upsert assignment
      // Unique constraint on TeachingAssignment: @@unique([professorId, offeringId])

      try {
        await prisma.teachingAssignment.upsert({
          where: {
            professorId_offeringId: {
              professorId: professor.id,
              offeringId,
            },
          },
          update: {}, // exists
          create: {
            professorId: professor.id,
            offeringId,
          },
        });
        console.log(`  ✓ Assigned ${user.name} to ${subjectCode}`);
      } catch (e) {
        console.error(
          `  ✗ Failed to assign ${user.name} to ${subjectCode}:`,
          e
        );
      }
    }
  }
}
