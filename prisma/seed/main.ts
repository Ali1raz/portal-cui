import prisma from "@/lib/prisma";
import { seedDirectors, seedAccountants } from "./admin";
import { seedProfessors, seedProfessorAssignments } from "./professors";
import { seedHODs } from "./hods";
import { seedSubjects, seedOfferings } from "./subjects";
import { seedStudents, seedStudentEnrollments } from "./students";

async function main() {
  console.log("🌱 Starting Database Seed...");

  try {
    // 1. Core Users & Admin Roles
    await seedDirectors();
    await seedAccountants();

    // 2. Academic Staff
    await seedProfessors();
    await seedHODs(); // Depends on Professors

    // 3. Curriculum
    await seedSubjects();
    await seedOfferings(); // Depends on Subjects

    // 4. Assignments (Must happen AFTER Professors AND Offerings)
    await seedProfessorAssignments();

    // 5. Students & Enrollments
    await seedStudents();
    await seedStudentEnrollments(); // Depends on Students AND Offerings
  } catch (e) {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Disconnected.");
  }
}

main();
