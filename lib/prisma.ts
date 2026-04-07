import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
