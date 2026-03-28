import prisma from "@/lib/prisma";
import { seedDirectors, seedAccountants } from "./admin";
import { seedProfessors } from "./professors";
import { seedHODs } from "./hods";
import { seedSubjects } from "./subjects";

async function main() {
  console.log("🌱 Starting Database Seed...");

  try {
    // 1. Core Users & Admin Roles
    await seedDirectors();
    await seedAccountants();

    // 2. Academic Staff
    await seedProfessors();
    await seedHODs();

    // 3. Curriculum
    await seedSubjects();

    // 6. Attendance
  } catch (e) {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Disconnected.");
  }
}

main();
