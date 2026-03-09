import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import prisma from "@/lib/prisma"; // Fix path to Prisma client
import { vi, beforeEach } from "vitest";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Mock the real prisma module deeper inside your app
vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
