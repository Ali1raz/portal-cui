import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SeedUser } from "./data";
import { Batch, Department, Program } from "@/lib/generated/prisma/enums";

/**
 * Ensures a user exists in the auth system and database.
 * 1. Checks if user exists by email.
 * 2. If not, signs them up via Better Auth.
 * 3. Upserts the user record in Prisma to enforce fixed ID and role.
 */
export async function ensureUser(user: SeedUser) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      console.log(`     ➤ Signing up new user: ${user.email}`);
      await auth.api.signUpEmail({
        body: {
          email: user.email,
          password: "12345678", // Default password for all seed users
          name: user.name,
          image: `https://avatar.vercel.sh/${user.name.split(" ")[0]}`,
        },
      });
    } else {
      console.log(`    ➤ User already exists: ${user.email}`);
    }

    // Always upsert to ensure the local DB record matches our fixed Seed ID and properties
    // This connects the auth-created user (which might have a random ID if created via API)
    // to our fixed ID if possible, OR just updates properties if we can't change ID easily.
    // NOTE: If the user was created by Auth, it has a generated ID. We might not be able to change it
    // if other things reference it, BUT for clean seeding we want to force our ID if possible,
    // or just accept the Auth ID.
    //
    // CRITICAL for this plan: We are assuming we can UPDATE the ID or that we are fresh.
    // If we can't update ID, our fixed ID plan fails.
    // However, Prisma usually allows updating ID if cascading is set or no references yet.
    // Let's try to upsert using email as unique key, and SET the ID.

    const finalUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        id: user.id, // Force our fixed ID
        name: user.name,
        role: user.role,
        emailVerified: true,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: true,
      },
    });

    return finalUser;
  } catch (error) {
    console.error(`    ✗ Failed to ensure user ${user.email}:`, error);
    throw error;
  }
}

// Helper function to get random element from array
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate registration number for students
export function generateRegistrationNo({
  usersLength,
  department,
  program,
  batch,
}: {
  usersLength: number;
  department: Department;
  program: Program;
  batch: Batch;
}): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const num = String(usersLength).padStart(3, "0");
  // Format: FA24-BSE-001
  return `${batch}${year}-${program}${department}-${num}`;
}

// Helper function to generate employee number
export function generateEmployeeNo({
  department,
  name,
}: {
  name: string;
  department: Department;
}): string {
  // Simple deterministic format
  const cleanName = name.replace(/\s+/g, "").toUpperCase().slice(0, 3);
  return `${department}-${cleanName}`;
}
