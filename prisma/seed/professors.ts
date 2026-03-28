import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import { SEED_USERS } from "./data";
import { ensureUser, generateEmployeeNo } from "./utils";

export async function seedProfessors() {
  console.log("\n👨‍🏫 Seeding Professors...");
  // Include both PROFESSOR and HOD roles since HODs are also professors
  const professors = SEED_USERS.filter(
    (u) => u.role === Role.PROFESSOR || u.role === Role.HOD
  );

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
