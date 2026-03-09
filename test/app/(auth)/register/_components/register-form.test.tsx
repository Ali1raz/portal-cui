import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/app/(auth)/register/_components/register-form";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/(auth)/actions";
import { toast } from "sonner";

// Mock the dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/app/(auth)/actions", () => ({
  signUp: vi.fn(),
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
  });

  it("renders the registration form correctly", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
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
    expect(signUp).not.toHaveBeenCalled();
  });

  it("submits successfully and redirects when valid data is provided", async () => {
    const user = userEvent.setup();

    // Mock successful sign up response
    (signUp as Mock).mockResolvedValue({
      status: "success",
      message: "Account created successfully",
    });

    render(<RegisterForm />);

    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");

    // Submit
    const submitButton = screen.getByRole("button", { name: /register/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Account created successfully"
      );
      expect(mockPush).toHaveBeenCalledWith("/register/success");
    });
  });

  it("shows error toast when registration fails", async () => {
    const user = userEvent.setup();

    // Mock failed sign up response
    (signUp as Mock).mockResolvedValue({
      status: "error",
      message: "Email already in use",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already in use");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
