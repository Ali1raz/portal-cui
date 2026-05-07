import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/app/(auth)/register/_components/register-form";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// Mock the dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("RegisterForm", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as Mock).mockReturnValue(new URLSearchParams());
  });

  it("renders the registration form correctly", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^password$/i, { selector: "input" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: /register/i });
    await user.click(submitButton);

    // Check if validation error messages are displayed (based on zod schema)
    await waitFor(() => {
      expect(
        screen.getByText(/Name must be 3 chars long/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Not a valid email/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Password should be 8 chars long/i)
      ).toBeInTheDocument();
    });

    // Ensure signUp was never called since validation failed
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });

  it("submits successfully and redirects when valid data is provided", async () => {
    const user = userEvent.setup();

    // Mock successful sign up response
    (authClient.signUp.email as Mock).mockImplementation(
      async (payload: {
        fetchOptions?: {
          onSuccess?: () => void;
          onError?: (ctx: { error: { message: string } }) => void;
        };
      }) => {
        payload.fetchOptions?.onSuccess?.();
        return { data: { user: { id: "user-1" } }, error: null };
      }
    );

    render(<RegisterForm />);

    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "Password123!"
    );

    // Submit
    const submitButton = screen.getByRole("button", { name: /register/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        callbackURL: "/",
        image: "https://avatar.vercel.sh/john",
        fetchOptions: expect.objectContaining({
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
        }),
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Registeration successful! Please check your email for verification link."
      );
      expect(mockPush).toHaveBeenCalledWith(
        "/register/success?email=john%40example.com"
      );
    });
  });

  it("shows error toast when registration fails", async () => {
    const user = userEvent.setup();

    // Mock failed sign up response
    (authClient.signUp.email as Mock).mockImplementation(
      async (payload: {
        fetchOptions?: {
          onSuccess?: () => void;
          onError?: (ctx: { error: { message: string } }) => void;
        };
      }) => {
        payload.fetchOptions?.onError?.({
          error: { message: "Email already in use" },
        });
        throw new Error("Email already in use");
      }
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: "input" }),
      "Password123!"
    );

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already in use");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
