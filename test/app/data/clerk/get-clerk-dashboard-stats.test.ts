import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClerkDashboardStats } from "@/app/data/clerk/get-clerk-dashboard-stats";
import { prismaMock } from "@/test/__mocks__/prisma";

vi.mock("@/app/data/permission/require-permission", () => ({
  requirePermission: vi.fn(),
}));

describe("getClerkDashboardStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stats from mocked transaction result", async () => {
    const { requirePermission } =
      await import("@/app/data/permission/require-permission");

    vi.mocked(requirePermission).mockResolvedValue(true);
    prismaMock.$transaction.mockResolvedValue([14, 5, 3, 2] as never);

    const data = await getClerkDashboardStats();

    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(data).toStrictEqual({
      totalApplications: 14,
      totalPending: 5,
      totalApproved: 3,
      activeSemesters: 2,
    });
  });
});
