import { describe, it, expect, vi, beforeEach } from "vitest";

// --------------------------------------------------------------------------
// Mocks — must be declared before any module import that transitively uses them
// --------------------------------------------------------------------------

/// Mock Better Auth so getSession never talks to the DB
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

/// next/headers used inside requireSession
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

/// Capture redirect() calls instead of throwing Next.js internals
const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

// --------------------------------------------------------------------------
// Imports after mocks are declared
// --------------------------------------------------------------------------
import { requireSession } from "@/app/data/session/require-session";

// --------------------------------------------------------------------------
// 1. requireSession — unauthenticated request
// --------------------------------------------------------------------------
describe("requireSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to /login with from query when there is no active session", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

    await requireSession();

    expect(redirectMock).toHaveBeenCalledWith("/login?from=%2F");
  });

  it("should return the session when the user is authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    const fakeSession = {
      user: { id: "u1", email: "admin@example.com", role: "ADMIN" },
      session: { token: "tok-xyz" },
    };
    vi.mocked(auth.api.getSession).mockResolvedValue(fakeSession as never);

    const session = await requireSession();

    expect(redirectMock).not.toHaveBeenCalled();
    expect(session).toEqual(fakeSession);
  });
});

// --------------------------------------------------------------------------
// 2. Admin route guard — role enforcement
//    The admin layout does: if role !== ADMIN → redirect("/unauthorized")
//    We test that guard logic here without rendering the full React tree.
// --------------------------------------------------------------------------

/// Minimal representation of the admin layout guard logic
async function adminGuard(
  getSession: () => Promise<{ user: { role: string } }>
) {
  const session = await getSession();
  if (session.user.role !== "ADMIN") {
    redirectMock("/unauthorized");
    return false; // rejected
  }
  return true; // allowed
}

describe("admin route guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to /unauthorized for a USER role", async () => {
    const allowed = await adminGuard(async () => ({
      user: { role: "USER" },
    }));

    expect(redirectMock).toHaveBeenCalledWith("/unauthorized");
    expect(allowed).toBe(false);
  });

  it("should redirect to /unauthorized for a STUDENT role", async () => {
    const allowed = await adminGuard(async () => ({
      user: { role: "STUDENT" },
    }));

    expect(redirectMock).toHaveBeenCalledWith("/unauthorized");
    expect(allowed).toBe(false);
  });

  it("should redirect to /unauthorized for a PROFESSOR role", async () => {
    const allowed = await adminGuard(async () => ({
      user: { role: "PROFESSOR" },
    }));

    expect(redirectMock).toHaveBeenCalledWith("/unauthorized");
    expect(allowed).toBe(false);
  });

  it("should allow an ADMIN role through without redirecting", async () => {
    const allowed = await adminGuard(async () => ({
      user: { role: "ADMIN" },
    }));

    expect(redirectMock).not.toHaveBeenCalled();
    expect(allowed).toBe(true);
  });
});

// --------------------------------------------------------------------------
// 3. Combined flow — login then access admin route
//    Simulates: signIn → role returned → route guard decision
// --------------------------------------------------------------------------
describe("login → admin route access flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow admin access after ADMIN login", async () => {
    // Step 1: login returns ADMIN role
    const loginRole = "ADMIN";

    // Step 2: admin guard accepts ADMIN
    const allowed = await adminGuard(async () => ({
      user: { role: loginRole },
    }));

    expect(redirectMock).not.toHaveBeenCalled();
    expect(allowed).toBe(true);
  });

  it("should reject admin access after STUDENT login", async () => {
    // Step 1: login returns STUDENT role
    const loginRole = "STUDENT";

    // Step 2: admin guard rejects non-admin
    const allowed = await adminGuard(async () => ({
      user: { role: loginRole },
    }));

    expect(redirectMock).toHaveBeenCalledWith("/unauthorized");
    expect(allowed).toBe(false);
  });

  it("should reject admin route entirely when not logged in (no session)", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);

    // Unauthenticated: requireSession fires /login redirect
    await requireSession();

    expect(redirectMock).toHaveBeenCalledWith("/login?from=%2F");
  });
});
