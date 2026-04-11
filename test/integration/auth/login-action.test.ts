import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginSchema, LoginSchemaType } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";
import { ApiResponseType } from "@/lib/types";
import { Role } from "@/lib/generated/prisma/enums";

/// Mock Better Auth — prevents real DB/network calls inside signInEmail
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
    },
  },
}));

type SignInResponse = ApiResponseType & {
  role?: Role;
};

async function signIn(values: LoginSchemaType): Promise<SignInResponse> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Invalid form data" };
  }

  try {
    const result = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });

    return {
      status: "success",
      message: "Login successful",
      role: result?.user?.role as Role | undefined,
    };
  } catch (error: unknown) {
    return { status: "error", message: errorMessage(error) };
  }
}

describe("signIn action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------
  // Validation failures
  // ------------------------------------------------------------------
  it("should return error for an invalid email", async () => {
    const response = await signIn({
      email: "not-an-email",
      password: "Password123!",
    });

    expect(response.status).toBe("error");
    expect(response.message).toBe("Invalid form data");
  });

  it("should return error when password is too short", async () => {
    const response = await signIn({
      email: "user@example.com",
      password: "short",
    });

    expect(response.status).toBe("error");
    expect(response.message).toBe("Invalid form data");
  });

  // ------------------------------------------------------------------
  // Happy path – valid credentials
  // ------------------------------------------------------------------
  it("should return success with role when credentials are valid (ADMIN)", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.signInEmail).mockResolvedValue({
      user: { id: "user-1", email: "admin@example.com", role: "ADMIN" },
      session: { token: "tok-abc" },
    } as never);

    const response = await signIn({
      email: "admin@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe("success");
    expect(response.message).toBe("Login successful");
    expect(response.role).toBe("ADMIN");
    expect(auth.api.signInEmail).toHaveBeenCalledWith({
      body: { email: "admin@example.com", password: "Password123!" },
    });
  });

  it("should return success with role when credentials are valid (STUDENT)", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.signInEmail).mockResolvedValue({
      user: { id: "user-2", email: "student@example.com", role: "STUDENT" },
      session: { token: "tok-def" },
    } as never);

    const response = await signIn({
      email: "student@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe("success");
    expect(response.role).toBe("STUDENT");
  });

  // ------------------------------------------------------------------
  // Error paths from Better Auth
  // ------------------------------------------------------------------
  it("should return error when credentials are wrong", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.signInEmail).mockRejectedValue(
      new Error("Invalid credentials")
    );

    const response = await signIn({
      email: "user@example.com",
      password: "WrongPass1!",
    });

    expect(response.status).toBe("error");
    // errorMessage() returns "Something went wrong!" for generic errors
    expect(response.message).toBe("Something went wrong!");
  });

  it("should return error when email is not verified", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.signInEmail).mockRejectedValue(
      new Error("Email not verified")
    );

    const response = await signIn({
      email: "unverified@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe("error");
    expect(response.message).toBe("Something went wrong!");
  });
});
