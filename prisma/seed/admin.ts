import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";
import { SEED_USERS } from "./data";
import { ensureUser } from "./utils";

export async function seedDirectors() {
  console.log("\n🎩 Seeding Directors...");
  const directors = SEED_USERS.filter((u) => u.role === Role.DIRECTOR);

  for (const user of directors) {
    await ensureUser(user);
    await prisma.director.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    console.log(`  ✓ Director: ${user.name}`);
  }
}

export async function seedAccountants() {
  console.log("\n💰 Seeding Accountants...");
  const accountants = SEED_USERS.filter((u) => u.role === Role.ACCOUNTANT);

  for (const user of accountants) {
    await ensureUser(user);
    await prisma.accountant.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    console.log(`  ✓ Accountant: ${user.name}`);
  }
}
