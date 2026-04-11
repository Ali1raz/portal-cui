import { beforeEach, describe, expect, it, vi } from "vitest";
import { userGetApplications } from "@/app/data/user/user-get-applications";
import { prismaMock } from "@/test/__mocks__/prisma";

vi.mock("@/app/data/session/require-session", () => ({
  requireSession: vi.fn(),
}));

vi.mock("@/app/data/permission/require-permission", () => ({
  requirePermission: vi.fn(),
}));

describe("userGetApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns applications for the authenticated user", async () => {
    const { requireSession } =
      await import("@/app/data/session/require-session");
    const { requirePermission } =
      await import("@/app/data/permission/require-permission");

    vi.mocked(requireSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(requirePermission).mockResolvedValue(true);

    prismaMock.studentApplication.findMany.mockResolvedValue([
      {
        id: "app-1",
        status: "PENDING",
        preferredDepartment: "CS",
        submittedAt: null,
        updatedAt: new Date("2026-01-15T10:00:00.000Z"),
        createdAt: new Date("2026-01-10T10:00:00.000Z"),
        _count: {
          applicationReviews: 2,
        },
      },
    ] as never);

    const data = await userGetApplications();

    expect(prismaMock.studentApplication.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
      select: {
        id: true,
        status: true,
        _count: {
          select: {
            applicationReviews: {
              where: {
                action: { not: "SUBMITTED" },
              },
            },
          },
        },
        preferredDepartment: true,
        submittedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    expect(data).toStrictEqual([
      {
        id: "app-1",
        status: "PENDING",
        preferredDepartment: "CS",
        submittedAt: null,
        updatedAt: new Date("2026-01-15T10:00:00.000Z"),
        createdAt: new Date("2026-01-10T10:00:00.000Z"),
        _count: {
          applicationReviews: 2,
        },
      },
    ]);
  });
});
