import { User } from "better-auth";
import {
  Batch,
  Department,
  Program,
  Role,
} from "../../lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

// Helper function to get random element from array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate random email
function generateRandomEmail(name: string): string {
  const randomNum = Math.floor(Math.random() * 10000);
  return `${name.toLowerCase().replace(/\s+/g, ".")}${randomNum}@example.com`;
}

// Helper function to generate registration number for students
function generateRegistrationNo(): string {
  const batch = getRandomElement([...Object.values(Batch)]);
  const year = Math.floor(Math.random() * (25 - 20 + 1) + 20); // 20-25
  const dept = getRandomElement([...Object.values(Department)]);
  const program = getRandomElement([...Object.values(Program)]);
  const number = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `${batch}${year}-${program}${dept}-${number}`;
}

// Helper function to generate employee number
function generateEmployeeNo(): string {
  const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `EMP-${number}`;
}

const seedData = {
  roles: Object.values(Role),
  names: [
    "Ahmed Hassan",
    "Fatima Khan",
    "Muhammad Ali",
    "Ayesha Malik",
    "Hassan Ahmed",
    "Sarah Smith",
    "John Doe",
    "Emily Johnson",
    "Robert Wilson",
    "Lisa Anderson",
  ],
  departments: Object.values(Department),
  batches: Object.values(Batch),
  programs: Object.values(Program),
};

async function main() {
  console.log("🌱 Starting database seed...");

  const createdUsers: Array<{ user: User; role: Role }> = [];

  // Create users with different roles
  console.log("👥 Creating users with random roles...");

  for (let i = 0; i < seedData.names.length; i++) {
    const name = seedData.names[i];
    const role = getRandomElement(seedData.roles);
    const email = generateRandomEmail(name);

    try {
      // Use prisma transaction for atomic operations
      const user = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            emailVerified: true,
            role,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          },
        });

        return newUser;
      });

      createdUsers.push({ user, role });
      console.log(`  ✓ Created user: ${name} (${role})`);
    } catch (error) {
      console.error(`  ✗ Failed to create user ${name}:`, error);
    }
  }

  // Create related records based on roles
  console.log("\n📚 Creating role-specific records...");

  for (const { user, role } of createdUsers) {
    try {
      if (role === Role.STUDENT) {
        const program = getRandomElement(seedData.programs);
        const year = Math.floor(Math.random() * 4) + 1; // 1-4
        const batch = getRandomElement(seedData.batches);
        const department = getRandomElement(seedData.departments);

        await prisma.student.create({
          data: {
            userId: user.id,
            registrationNo: generateRegistrationNo(),
            program,
            year,
            batch,
            department,
          },
        });
        console.log(
          `  ✓ Created student: ${user.name} (${batch}${year}-${program})`
        );
      }

      if (role === Role.PROFESSOR) {
        const department = getRandomElement(seedData.departments);
        const programs = [getRandomElement(seedData.programs)];

        await prisma.professor.create({
          data: {
            userId: user.id,
            employeeNo: generateEmployeeNo(),
            department,
            programs,
          },
        });
        console.log(`  ✓ Created professor: ${user.name} (${department} dept)`);
      }

      if (role === Role.HOD) {
        const department = getRandomElement(seedData.departments);
        const now = new Date();
        const appointmentDate = new Date(now.getFullYear() - 2, 0, 1); // 2 years ago
        const endDate = new Date(now.getFullYear() + 1, 11, 31); // 1 year from now

        await prisma.hod.create({
          data: {
            userId: user.id,
            department,
            year: appointmentDate,
            endYear: endDate,
          },
        });
        console.log(`  ✓ Created HOD: ${user.name} (${department} dept)`);
      }

      if (role === Role.DIRECTOR) {
        await prisma.director.create({
          data: {
            userId: user.id,
          },
        });
        console.log(`  ✓ Created director: ${user.name}`);
      }

      if (role === Role.ACCOUNTANT) {
        await prisma.accountant.create({
          data: {
            userId: user.id,
          },
        });
        console.log(`  ✓ Created accountant: ${user.name}`);
      }
    } catch (error) {
      console.error(
        `  ✗ Failed to create ${role} record for ${user.name}:`,
        error
      );
    }
  }

  // Print summary
  console.log("\n✅ Database seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`  • Total users created: ${createdUsers.length}`);

  const stats = {
    students: createdUsers.filter((u) => u.role === Role.STUDENT).length,
    professors: createdUsers.filter((u) => u.role === Role.PROFESSOR).length,
    hods: createdUsers.filter((u) => u.role === Role.HOD).length,
    directors: createdUsers.filter((u) => u.role === Role.DIRECTOR).length,
    accountants: createdUsers.filter((u) => u.role === Role.ACCOUNTANT).length,
  };

  console.log(`  • Students: ${stats.students}`);
  console.log(`  • Professors: ${stats.professors}`);
  console.log(`  • HODs: ${stats.hods}`);
  console.log(`  • Directors: ${stats.directors}`);
  console.log(`  • Accountants: ${stats.accountants}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n🔌 Prisma Client disconnected");
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
