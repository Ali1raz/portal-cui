import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, type Mock, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/(auth)/login/_components/login-form";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Role } from "@/lib/generated/prisma/enums";

// Mock the dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    email: vi.fn(),
  },
  authClient: {
    getSession: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("LoginForm", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams());
  });

  it("renders the login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^password$/i, { selector: "input" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    // Check if validation error messages are displayed (based on zod schema)
    await waitFor(() => {
      expect(screen.getByText(/Not a valid email/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Password should be 8 chars long/i)
      ).toBeInTheDocument();
    });

    // Ensure signIn was never called since validation failed
    expect(signIn.email).not.toHaveBeenCalled();
  });

  it("submits successfully and redirects based on DIRECTOR role", async () => {
    const user = userEvent.setup();

    // Mock successful sign in
    (signIn.email as Mock).mockResolvedValue({
      data: { user: { id: "1" } },
      error: null,
    });

    // Mock session refresh with DIRECTOR role
    (authClient.getSession as Mock).mockResolvedValue({
      data: { user: { role: Role.DIRECTOR } },
    });

    render(<LoginForm />);

    // Fill out the form
    await user.type(screen.getByLabelText(/email/i), "director@example.com");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "Password123!"
    );

    // Submit
    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: "director@example.com",
        password: "Password123!",
      });

      expect(toast.success).toHaveBeenCalledWith("Login successful");
      expect(authClient.getSession).toHaveBeenCalledWith({
        query: { disableCookieCache: true },
      });
      expect(mockPush).toHaveBeenCalledWith("/director");
    });
  });

  it("submits successfully and redirects based on STUDENT role", async () => {
    const user = userEvent.setup();

    (signIn.email as Mock).mockResolvedValue({ data: {}, error: null });
    (authClient.getSession as Mock).mockResolvedValue({
      data: { user: { role: Role.STUDENT } },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "student@example.com");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "Password123!"
    );
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/student");
    });
  });

  it("submits successfully and redirects to professor dashboard for PROFESSOR role", async () => {
    const user = userEvent.setup();

    (signIn.email as Mock).mockResolvedValue({ data: {}, error: null });
    (authClient.getSession as Mock).mockResolvedValue({
      data: { user: { role: Role.PROFESSOR } },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "professor@example.com");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "Password123!"
    );
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/professor");
    });
  });

  it("shows error toast when login fails", async () => {
    const user = userEvent.setup();

    // Mock failed sign in response
    (signIn.email as Mock).mockResolvedValue({
      data: null,
      error: { message: "Invalid email or password" },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "WrongPass123!"
    );

    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password");
      expect(authClient.getSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
