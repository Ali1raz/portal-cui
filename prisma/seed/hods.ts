import prisma from "@/lib/prisma";
import { SEED_USERS } from "./data";

export async function seedHODs() {
  console.log("\n👑 Seeding HODs...");

  // In our data.ts, we identified HODs by their role being PROFESSOR (as they are profs)
  // but we can identify them by explicit ID convention or just picking one per department.
  // Our data.ts has specific users like "user-hod-cs-01".

  const hodUsers = SEED_USERS.filter((u) => u.id.includes("hod"));

  for (const user of hodUsers) {
    if (!user.department) continue;

    // User and Professor record should already be created by seedProfessors
    // We just link the HOD record.

    await prisma.hod.upsert({
      where: { department: user.department },
      update: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        department: user.department,
      },
    });
    console.log(`  ✓ HOD: ${user.name} (${user.department})`);
  }
}
