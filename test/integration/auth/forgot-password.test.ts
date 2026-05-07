import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SendEmail } from "@/app/actions/send-email";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { errorMessage } from "@/lib/error-message";

const emailSchema = z.string().email({ message: "Not a valid email." });

/// Sends a password-reset link to the given email address.
/// Returns `success` when the link is dispatched; `error` on validation failure
/// or if Better Auth throws.
async function forgotPassword(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data, redirectTo: "/reset-password" },
    });

    return {
      status: "success",
      message: "Password reset link sent to your email.",
    };
  } catch (error: unknown) {
    return { status: "error", message: errorMessage(error) };
  }
}

/// Use vi.hoisted so sendMailMock is defined before vi.mock factories are hoisted
const sendMailMock = vi.hoisted(() => vi.fn());

/// Mock Better Auth to avoid real DB/network calls in the forgot-password action
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      requestPasswordReset: vi.fn(),
    },
  },
}));

/// Mock nodemailer transporter at module level (referenced by sendMailMock above)
vi.mock("@/lib/nodemailer", () => ({
  transporter: { sendMail: sendMailMock },
}));

vi.mock("@/lib/env", () => ({
  env: {
    get NODE_ENV() {
      return process.env.NODE_ENV ?? "test";
    },
    get NODEMAILER_USER() {
      return process.env.NODEMAILER_USER ?? "noreply@example.com";
    },
  },
}));

// --------------------------------------------------------------------------
// 1. Server action tests (forgotPassword)
// --------------------------------------------------------------------------
describe("forgotPassword action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error for an invalid email", async () => {
    const response = await forgotPassword("not-an-email");
    expect(response.status).toBe("error");
    expect(response.message).toBe("Not a valid email.");
  });

  it("should call requestPasswordReset and return success for a valid email", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.requestPasswordReset).mockResolvedValue(
      undefined as never
    );

    const response = await forgotPassword("user@example.com");

    expect(response.status).toBe("success");
    expect(response.message).toBe("Password reset link sent to your email.");
    expect(auth.api.requestPasswordReset).toHaveBeenCalledWith({
      body: { email: "user@example.com", redirectTo: "/reset-password" },
    });
  });

  it("should return error when requestPasswordReset throws", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth.api.requestPasswordReset).mockRejectedValue(
      new Error("User not found")
    );

    const response = await forgotPassword("ghost@example.com");

    expect(response.status).toBe("error");
    expect(response.message).toBe("Something went wrong: ");
  });
});

// --------------------------------------------------------------------------
// 2. Dev mail-log tests  (NODE_ENV !== 'production' → console.log)
//    These validate what appears in the dev mail log when an email is sent.
// --------------------------------------------------------------------------
describe("SendEmail – dev mail log (NODE_ENV=test)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should log [DEV EMAIL] with full payload when SendEmail is called", async () => {
    const payload = {
      to: "user@example.com",
      subject: "Reset password",
      meta: {
        description: "Click this link to reset your password:",
        link: "https://example.com/reset-password?token=abc123",
      },
    };

    const result = await SendEmail(payload);

    expect(result).toEqual({ success: true });
    expect(consoleSpy).toHaveBeenCalledWith("[DEV EMAIL]", {
      to: payload.to,
      subject: payload.subject,
      meta: payload.meta,
    });
  });

  it("should log [DEV EMAIL] even when no link is provided", async () => {
    const result = await SendEmail({
      to: "admin@example.com",
      subject: "Notification",
      meta: { description: "Your account settings changed." },
    });

    expect(result).toEqual({ success: true });
    expect(consoleSpy).toHaveBeenCalledWith("[DEV EMAIL]", {
      to: "admin@example.com",
      subject: "Notification",
      meta: { description: "Your account settings changed." },
    });
  });
});

// --------------------------------------------------------------------------
// 3. Production mail path – nodemailer transporter mock
// --------------------------------------------------------------------------
describe("SendEmail – production path", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NODEMAILER_USER", "noreply@example.com");
    sendMailMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should call transporter.sendMail with the correct HTML payload", async () => {
    sendMailMock.mockResolvedValue({ messageId: "test-id" });

    const result = await SendEmail({
      to: "user@example.com",
      subject: "Reset password",
      meta: {
        description: "Click this link to reset your password:",
        link: "https://example.com/reset-password?token=xyz",
      },
    });

    expect(result).toEqual({ success: true });
    expect(sendMailMock).toHaveBeenCalledOnce();

    const [mailOptions] = sendMailMock.mock.calls[0];
    expect(mailOptions.to).toBe("user@example.com");
    expect(mailOptions.subject).toBe("Reset password");
    expect(mailOptions.html).toContain(
      "Click this link to reset your password:"
    );
    expect(mailOptions.html).toContain(
      "https://example.com/reset-password?token=xyz"
    );
  });

  it("should return { success: false } when transporter.sendMail throws", async () => {
    sendMailMock.mockRejectedValue(new Error("SMTP error"));

    const result = await SendEmail({
      to: "user@example.com",
      subject: "Reset password",
      meta: { description: "Something went wrong on the mailer side." },
    });

    expect(result).toEqual({ success: false });
  });
});
