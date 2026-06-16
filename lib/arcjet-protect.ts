import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { format } from "date-fns";

/**
 * Rate-limits a user for a specific action.
 * Returns an error message string if denied, or null if allowed.
 *
 * Usage:
 *
 * ```ts
 * export async function someAction() {
 *   const deniedMessage = await protect(session.user.id, { action: "hod:announcement:update", max: 20, window: "10m" });
 *   if (deniedMessage) return { status: "error", message: deniedMessage };
 * }
 * ```
 */
export async function protect(
  userId: string,
  {
    action = "unknown",
    max = 10,
    window = "10m",
  }: {
    action?: string;
    max?: number;
    window?: string;
  } = {}
): Promise<string | null> {
  const aj = arcjet.withRule(
    fixedWindow({
      characteristics: ["fingerprint"],
      mode: "LIVE",
      window,
      max,
    })
  );

  const req = await request();
  const decision = await aj.protect(req, {
    fingerprint: `${action}:${userId}`,
  });

  if (!decision.isDenied()) return null;
  if (decision.reason.isBot()) return "You are a bot.";
  if (decision.reason.isRateLimit()) {
    const reset = decision.reason.resetTime;
    return reset
      ? `Too many requests. Try again at: ${format(reset, "MMMM d, yyyy hh:mm a")}`
      : "Too many requests. Try again later.";
  }

  return "You are not allowed!";
}
