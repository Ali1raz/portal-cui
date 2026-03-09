import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUp } from "@/app/(auth)/actions";

/// Mock Better Auth directly — avoids needing to stub all internal Prisma adapter calls
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}));

describe("signUp integration test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail validation for invalid data", async () => {
    const invalidData = {
      name: "Ab", // too short
      email: "invalid-email", // invalid email format
      password: "short", // too short
    };

    const response = await signUp(invalidData);
    expect(response.status).toBe("error");
    expect(response.message).toBe("Invalid form data");
  });

  it("should successfully sign up a new user with valid data", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.signUpEmail).mockResolvedValue({} as never);

    const validData = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    };

    const response = await signUp(validData);

    expect(response.status).toBe("success");
    expect(response.message).toBe("Signup successful");
    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: validData.name,
        email: validData.email,
        password: validData.password,
      },
    });
  });

  it("should return error when signUpEmail throws", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.signUpEmail).mockRejectedValue(
      new Error("Email already in use")
    );

    const validData = {
      name: "Existing User",
      email: "existing@example.com",
      password: "Password123!",
    };

    const response = await signUp(validData);

    expect(response.status).toBe("error");
    // errorMessage() returns "Something went wrong!" for generic errors
    expect(response.message).toBe("Something went wrong!");
  });
});
